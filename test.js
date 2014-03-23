// Dependencies.

var assert = require( 'assert' ),
	hmm = require( './hmm.js' ),
	model;

// Tests.

describe( 'Hidden Markov Model', function () {

	before( function ( done ) {
		model = new hmm(
			[ '1', '2', '3', 'F' ],
			'F', [ 'a', 'b', 'c' ], {
				'1': 1
			}, {
				'1': {
					'1': 0.2,
					'2': 0.5,
					'3': 0.3
				},
				'2': {
					'1': 0.1,
					'3': 0.9
				},
				'3': {
					'3': 0.4,
					'F': 0.6
				}
			}, {
				'1': {
					'b': 0.3,
					'c': 0.7
				},
				'2': {
					'a': 0.3,
					'b': 0.6,
					'c': 0.1
				},
				'3': {
					'a': 1,
				}
			}
		);

		done();
	} );

	it( "Generation Probability should return the Viterbi Approximation", function ( done ) {

		assert.equal( model.generationProbability( [ 'b', 'c', 'b', 'a' ] ), 0.006804 );
		done();

	} );

} );