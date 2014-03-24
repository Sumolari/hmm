// Dependencies.

var assert = require( 'assert' ),
	hmm = require( './hmm.js' ),
	model, case_1 = {
		item: [ 'b', 'c', 'b', 'a' ],
		viterbi: 0.006804,
		forward: 0.007339
	}, case_2 = {
		item: [ 'b', 'c', 'b', 'b' ],
		viterbi: 0,
		forward: 0
	}, case_3 = {
		item: [ 'b', 'c', 'b', 'd' ],
		viterbi: 0,
		forward: 0
	};

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

	it( "Viterbi Approximation returns approximated probability",
		function ( done ) {
			assert.equal(
				model.viterbiApproximation( case_1.item ), case_1.viterbi );
			done();
		} );

	it( "Forward Probabilty returns real probability",
		function ( done ) {
			assert.equal(
				model.forwardProbability( case_1.item ), case_1.forward );
			done();
		} );

	it( "Viterbi Approximation returns approximated probability even if it " +
		"is not possible to generate that item",
		function ( done ) {
			assert.equal(
				model.viterbiApproximation( case_2.item ), case_2.viterbi );
			done();
		} );

	it( "Forward Probabilty returns real probability even if it is not " +
		"possible to generate that item",
		function ( done ) {
			assert.equal(
				model.forwardProbability( case_2.item ), case_2.forward );
			done();
		} );

	it( "Viterbi Approximation returns approximated probability even if it " +
		"has non existing symbols",
		function ( done ) {
			assert.equal(
				model.viterbiApproximation( case_3.item ), case_3.viterbi );
			done();
		} );

	it( "Forward Probabilty returns real probability even if it has non " +
		"existing symbols ",
		function ( done ) {
			assert.equal(
				model.forwardProbability( case_3.item ), case_3.forward );
			done();
		} );

	it( "Forward Probabilty returns real probability even if it has non " +
		"existing symbols ",
		function ( done ) {
			assert.equal(
				model.forwardProbability( case_3.item ), case_3.forward );
			done();
		} );

} );