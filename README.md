This module implements a Hidden Markov Model featuring methods to obtain the real generation probability and Viterbi approximations as well as methods to initialize and/or reestimate a HMM given a set of generated items with Viterbi re-estimation and linear segmentation.

# Dependencies

Although the implementation itself does not require any additional module you'll need Mocha to run the tests.

# Usage

This project can be used as a NodeJS module:

```javascript
var hmm = require( './hmm.js' );
var aModel = new hmm();
```

## Initializing with explicit details

A Hidden Markov Model can be initialized giving the explicit list of states (including final state), symbols, initial probabilities, transition probabilities and emission probabilities.

```javascript
aModel = new hmm(
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
```

## Reestimating an existing Hidden Markov Model

If you have an existing HMM and want to reestimate it with some training samples you can do it with `reestimate` method:

```javascript
aModel.reestimate( [ [ 'b', 'c', 'b', 'a' ], [ 'b', 'c', 'b', 'b' ], [ 'b', 'c', 'b', 'd' ] ] );

```

Optionally you can give an array of optimal paths as second parameter. If you don't give that array of paths the method will compute the optimal paths for each one of given items, so be sure that given items could be generated with the model.

## Initializing a new Hidden Markov Model given some training samples

To initialize a new Hidden Markov Model without having a previous model you can use `initialize` method:

```javascript
aModel.initialize( [ [ 'b', 'c', 'b', 'a' ], [ 'b', 'c', 'b', 'b' ], [ 'b', 'c', 'b', 'd' ] ], 3 );
```

This method will initialize the model, using linear segmentation to decide which will be the optimal state sequence for each one of the items and after that will reestimate the model.

# Tasks

There are 2 Make tasks provided:

* `make test` will run Mocha tests. 
* `make doc` will create the documentation folder (`doc`). You'll need Yuidoc to get the documentation.