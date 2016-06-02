# Dependencies.

expect = require( 'chai' ).expect
hmm = require '../src/hmm'
model = {}
case_1 =
  item: [ 'b', 'c', 'b', 'a' ]
  viterbi: 0.006804,
  forward: 0.007339,
  trained: 0.062500

case_2 =
  item: [ 'b', 'c', 'b', 'b' ]
  viterbi: 0
  forward: 0

case_3 =
  item: [ 'b', 'c', 'b', 'd' ]
  viterbi: 0
  forward: 0

case_4 =
  item: [ 'white', 'bottle' ]
  trained: 1
  n: 2

# Tests.

describe 'Hidden Markov Model', ->

  before ( done ) ->
    model = new hmm [ '1', '2', '3', 'F' ], 'F', [ 'a', 'b', 'c' ],
        1: 1
      ,
        1:
          1: 0.2
          2: 0.5
          3: 0.3
        2:
          1: 0.1
          3: 0.9
        3:
          3: 0.4
          F: 0.6
      ,
        1:
          b: 0.3
          c: 0.7
        2:
          a: 0.3
          b: 0.6
          c: 0.1
        3:
          a: 1

    done()

  it 'Viterbi Approximation returns approximated probability', ( done ) ->
    expect( model.viterbiApproximation case_1.item ).to.be.equal case_1.viterbi
    done()

  it 'Forward Probabilty returns real probability', ( done ) ->
    expect( model.generationProbability case_1.item ).to.be.equal case_1.forward
    done()

  it 'Viterbi Approximation returns approximated probability even if it
       is not possible to generate that item', ( done ) ->
      expect( model.viterbiApproximation case_2.item ).to.be.equal case_2.viterbi
      done()

  it 'Forward Probabilty returns real probability even if it is not
       possible to generate that item', ( done ) ->
      expect( model.generationProbability case_2.item ).to.be.equal case_2.forward
      done()

  it 'Viterbi Approximation returns approximated probability even if it
       has non existing symbols', ( done ) ->
      expect( model.viterbiApproximation case_3.item ).to.be.equal case_3.viterbi
      done()

  it 'Forward Probabilty returns real probability even if it has non existing
       symbols', ( done ) ->
      expect( model.generationProbability case_3.item ).to.be.equal case_3.forward
      done()

  it 'After reestimating the model with one sample the probability of
       generating that sample is higher', ( done ) ->
      model.reestimate [ case_1.item ]
      expect( model.viterbiApproximation case_1.item ).to.be.equal case_1.trained
      expect( model.generationProbability case_1.item ).to.be.equal case_1.trained
      done()

  it 'After initialising the model with a sample the probability of generating
       the sample is 100%', ( done ) ->
      model = new hmm()
      model.initialize [ case_4.item ], case_4.n
      expect( model.viterbiApproximation case_4.item ).to.be.equal case_4.trained
      expect( model.generationProbability case_4.item ).to.be.equal case_4.trained
      done()

  it 'After initialising the model with some samples the probability of any one
       of them is bigger than 0', ( done ) ->
      model = new hmm()
      cases = [ case_1.item, case_2.item, case_3.item, case_4.item ]
      model.initialize cases, cases.length
      for i in cases
        expect( model.viterbiApproximation i ).to.be.above 0
        expect( model.generationProbability i ).to.be.above 0
      done()
