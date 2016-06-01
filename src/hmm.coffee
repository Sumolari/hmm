
_ = require 'lodash'

###
A Hidden Markov Model implementation in Javascript.
###

class HMM

  ###
  Constructs a new Hidden Markov Model. All parameters are optional.

  @param [Array<String>] states States of the model.
  @param [String] finalState Final state of the model.
  @param [Array<String>] symbols Symbols of the model.
  @param [Dict<String,Float>] initialProbability
  Initial Probability of the model.
  @param [Dict<String, Dict<String, Float>>] transitionProbability
  Transition Probability of the model.
  @param [Dict<String, Dict<String, Float>>] emissionProbability
  Emission Probability of the model.
  @return [HMM] New Hidden Markov Model.
  ###
  constructor: (
    @states = [],
    @finalState = '',
    @symbols = [],
    @initialProbability = {},
    @transitionProbability = {},
    @emissionProbability = {}
  ) ->

  ###
  Returns the initial probability of given state.

  @param [String] state State whose initial probability will be retrieved.
  @return [Float] Probability that the initial state is given one.
  ###
  ip: (state) ->
    return @initialProbability[state] ? 0

  ###
  Returns the probability of moving from given source state to given destination
  state.

  @param [String] source Initial state.
  @param [String] target Destination state.
  @return [Float] Probability of moving from given initial state to given
  destination state.
  ###
  tp: (source, target) ->
    return @transitionProbability[source]?[target] ? 0

  ###
  Returns the probability that given state emits given symbol.

  @param [String] state State that will be emitting the symbol.
  @param [String] symbol Symbol that should be emitted.
  @return [Float] Probability that given state emits given symbol.
  ###
  ep: (state, symbol) ->
    return @emissionProbability[state]?[symbol] ? 0

  ###
  Returns a printable string with this model's information.

  @return [String] Printable string with this model's information.
  ###
  toString: ->
    str = 'A\t'

    for state in @states
      str += "#{state}\t"
    str += '\n'

    for source in @states
      str += "#{source}\t"
      for target in @states
        str += "#{@tp source, target}\t"
      str += '\n'

    str += '\nB\t'
    for symbol in @symbols
      str += "#{symbol}\t"
    str += '\n'

    for state in @states
      continue if state is @finalState
      str += "#{state}\t"
      for symbol in @symbols
        str += "#{@ep state, symbol}\t"
      str += '\n'

    str += '\nInitial:\n'
    for state in @states
      str += "#{state}:\t#{@ip state}\n"
    str += "\nFinal: #{@finalState}"

    return str

  ###
  Prints a representation of this model.
  ###
  print: ->
    console.log @toString()

  ###
  Reestimates this model to properly classify given obversed sequences.

  @param [Array<String>] items Items used to reestimate this model.
  @param [Array<String>] path Optional. Array of optimal paths for each one of
  given items. If no paths are given they are computed with Viterbi algorithm.
  ###
  reestimate: (items, paths) ->

    shouldRepeat = true

    while shouldRepeat

      initials = {}
      transitions = {}
      symbols = {}

      original =
        st: @states
        sy: @symbols
        fs: @finalState
        ip: @initialProbability
        tp: JSON.stringify @transitionProbability
        ep: JSON.stringify @emissionProbability

      unless paths?
        paths = []
        for item in items
          paths.push @viterbi( item ).path

      @transitionProbability = {}
      @emissionProbability = {}

      for path in paths
        head = _.head path
        initials[ head ] ?= 0
        initials[ head ]++

      for state in initials
        @initialProbability[ state ] = initials[ state ] / paths.length

      sum = {}
      for path, index in paths
        item = items[ index ]
        for j in [0...(path.length - 1)]
          source = path[ j ]
          target = path[ j + 1 ]
          sum[ source ] ?= 0
          sum[ source ]++
          transitions[ source ] ?= {}
          transitions[ source ][ target ] ?= 0
          transitions[ source ][ target ]++
          symbols[ source ] ?= {}
          symbols[ source ][ item[ j ] ] ?= 0
          symbols[ source ][ item[ j ] ]++

      for src, transition of transitions
        for dst, transition_count of transition
          @transitionProbability[ src ] ?= {}
          @transitionProbability[ src ][ dst ] = transition_count / sum[ src ]
        for symbol, symbol_count of symbols[ src ]
          @emissionProbability[ src ] ?= {}
          @emissionProbability[ src ][ symbol ] = symbol_count / sum[ src ]

      shouldRepeat =
        original.st isnt @states or
        original.sy isnt @symbols or
        original.ip isnt @initialProbability or
        original.tp isnt JSON.stringify @transitionProbability or
        original.ep isnt JSON.stringify @emissionProbability

  ###
  Initializes this model with given items.

  @param [Array<String>] items Items used to reestimate this model.
  @param [Integer] n Number of states to use in this model.
  ###
  initialize: (items, n) ->
    paths = []
    @symbols = []
    @states = ("#{i}" for i in [1..n])
    @finalState = 'F'
    @states.push @finalState

    for sequence in items
      for symbol in sequence
        @symbols.push symbol unless symbol in @symbols

    for sequence in items
      path = []
      for j in [1..sequence.length]
        path.push "#{1 + Math.floor j * n / (sequence.length + 1)}"
      path.push @finalState
      paths.push path

    @reestimate items, paths

  ###
  Returns the Viterbi approximation to the probability of this model generating
  given item using the fastest implementation available.

  @param [Array<String>] item Item whose generation probability will be returned.
  @return [Float] Viterbi approximation to the probability of this markov model
  generating given item.
  ###
  viterbiApproximation: (item) ->
    return @viterbi( item ).probability

  ###
  Returns most probable sequence of states generating given item (if any).

  @param [Array<String>] item Item whose optimal state sequence will be returned.
  @return [Array<String>] Optimal state sequence generating given item.
  If given item can't be generate undefined is returned.
  ###
  optimalStateSequence: ( item ) ->
    return @viterbi( item ).path

  ###
  Returns the Viterbi approximation to the probability of this model generating
  given item.

  @param [Array<String>] item Item whose generation probability will be returned.
  @return [Object] Viterbi approximation to the probability of this markov model
  generating given item: an object with a `probability` and a `path` key.
  ###
  viterbi: (item) ->

    V = [ {} ]
    path = {}

    for state in @states
      V[ 0 ][ state ] = @ip( state ) * @ep( state, _.head item )
      path[ state ] = [ state ]

    for t in [1...item.length]
      V.push {}
      newpath = {}

      for target in @states
        max = [ 0, null ]
        for source in @states
          tep = @tp( source, target ) * @ep( target, item[ t ] )
          calc = V[ t - 1 ][ source ] * tep
          max = [ calc, source ] if calc >= _.head max

        V[ t ][ target ] = _.head max
        newpath[ target ] = path[ _.last max ].concat target

      path = newpath

    V.push {}
    newpath = {}

    max = [ 0, null ]
    for source in @states
      calc = V[ t - 1 ][ source ] * @tp source, @finalState
      max = [ calc, source ] if calc >= _.head max

    V[ item.length ][ @finalState ] = _.head max
    path[ @finalState ] = path[ _.last max ].concat @finalState

    max = [ 0, null ]
    for state in @states
      calc = V[ item.length ][ state ] ? 0
      max = [ calc, state ] if calc >= _.head max

    return {
      probability: parseFloat _.head( max ).toFixed 6
      path: path[ _.last max ]
    }

  ###
  Returns the real probability of this model generating given item.

  @param [Array<String>] item Item whose generation probability will be returned.
  @param [String] state Optional. Initial state for computation. If no state is
  given then all of them will be taken into account.
  @return [Float] Real probability of this markov model generating given item.
  ###
  forwardProbability: (item, state) ->
    symbol = _.head item
    rest = _.tail item
    probability = 0

    getSequenceProbability = (source, sequence) =>
      return @tp source, @finalState if sequence.length is 0
      probability = 0
      for target in @states
        tpp = @tp source, target
        tpfp = @forwardProbability sequence, target
        probability += tpp * tpfp
      return probability

    unless state?
      for state in @states
        iep = @ep( state, symbol ) * @ip( state )
        probability += iep * getSequenceProbability( state, rest ) if iep > 0
    else
      probability = @ep( state, symbol ) * getSequenceProbability( state, rest )

    return parseFloat probability.toFixed 6

  ###
  Returns the probability that given item is generated by this model.
  Note that this method is much more expensive than the Viterbi Approximation
  and the results are similar.

  @param [Array<String>] item Item whose generation probability will be returned.
  @return [Float] Probability that this model generates given item.
  ###
  generationProbability: (item) ->
    return @forwardProbability item

module.exports = HMM