# Dependencies.

expect = require( 'chai' ).expect
hmm = require '../'
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

describe 'Semaphore model', ->

  before ( done ) ->
    model = new hmm [ 'red', 'yellow', 'green', ], 'green', [ 'go', 'stop' ],
        red: 0.8
        green: 0.2
      ,
        green:
          yellow: 0.3
          green: 0.7
        yellow:
          stop: 0.8
          yellow: 0.2
        red:
          red: 0.6
          green: 0.4
      ,
        red:
          stop: 0.9
          go: 0.1
        yellow:
          stop: 0.5
          go: 0.5
        green:
          go: 1

    done()

  it 'Possible sequence should have a ≥ 0 probability', ( done ) ->
    sequence = [ 'go', 'stop', 'go' ]
    expect( model.viterbiApproximation sequence ).to.be.above 0
    expect( model.forwardProbability sequence ).to.be.above 0
    done()

  it 'Possible sequence should return an optimal state sequence', (done) ->
    sequence = [ 'go', 'stop', 'go' ]
    expect( model.optimalStateSequence sequence )
      .to.be.deep.equal [ 'red', 'red', 'green', 'green' ]
    done()
