// Let's define some alias classes.

/**
 * String representing a state.
 * @class HMMState
 */

/**
 * String representing a symbol.
 * @class  HMMSymbol
 */

/**
 * Number between 0 and 1.
 * @class  Probability
 */

/**
 * A Hidden Markov Model implementation in Javascript.
 * @class  HMM
 * @constructor
 * @param {[HMMState]}                       states                Optional.
 *                                                                 States of
 *                                                                 the model.
 * @param {HMMState}                         finalState            Optional.
 *                                                                 Final state
 *                                                                 of the model.
 * @param {[HMMSymbol]}                      symbols               Optional.
 *                                                                 Symbols of
 *                                                                 the model.
 * @param {HMMState->Probability}            initialProbability    Optional.
 *                                                                 Initial
 *                                                                 Probability
 *                                                                 of the model.
 * @param {HMMState->HMMState->Probability}  transitionProbability Optional.
 *                                                                 Transition
 *                                                                 Probability
 *                                                                 of the model.
 * @param {HMMState->HMMSymbol->Probability} emissionProbability   Optional.
 *                                                                 Emission
 *                                                                 Probability
 *                                                                 of the model.
 * @return {HMM} Empty Hidden Markov Model.
 */
module.exports = function (
	states,
	finalState,
	symbols,
	initialProbability,
	transitionProbability,
	emissionProbability ) {

	/**
	 * Set of states.
	 * @property states
	 * @type [HMMState]
	 */
	this.states = states || [];

	/**
	 * Final state of this model.
	 * @property finalState
	 * @type {HMMState}
	 */
	this.finalState = finalState || "";

	/**
	 * Set of observable symbols.
	 * @property symbols
	 * @type [HMMSymbol]
	 */
	this.symbols = symbols || [];

	/**
	 * Initial probability vector.
	 * @property initialProbability
	 * @type {HMMState->Probability}
	 */
	this.initialProbability = initialProbability || {};

	/**
	 * Returns the initial probability of given state.
	 * @param  {HMMState} state State whose initial probability will be
	 *                          retrieved.
	 * @return {Probability}    Probability that the initial state is given one.
	 */
	this.ip = function ( state ) {
		return this.initialProbability[ state ] || 0;
	};

	/**
	 * Transition probability matrix.
	 * @property transitionProbability
	 * @type {HMMState->HMMState->Probability}
	 */
	this.transitionProbability = transitionProbability || {};

	/**
	 * Returns the probability of moving from given source state to given
	 * destination state.
	 * @param  {HMMState} source Initial state.
	 * @param  {HMMState} target Destination state.
	 * @return {Probability}     Probability of moving from given initial state
	 *                           to given destination state.
	 */
	this.tp = function ( source, target ) {
		if ( this.transitionProbability[  source ] )
			return this.transitionProbability[ source ][ target ] || 0;
		return 0;
	};

	/**
	 * Emission probability matrix. Probability that a state emits an
	 * observable symbol.
	 * @property emissionProbability
	 * @type {HMMState->HMMSymbol->Probability}
	 */
	this.emissionProbability = emissionProbability || {};

	/**
	 * Returns the probability that given state emits given symbol.
	 * @param  {HMMState}  state  State that will be emitting the symbol.
	 * @param  {HMMSymbol} symbol Symbol that should be emitted.
	 * @return {Probability}      Probability that given state emits given
	 *                            symbol.
	 */
	this.ep = function ( state, symbol ) {
		if ( this.emissionProbability[ state ] )
			return this.emissionProbability[ state ][ symbol ] || 0;
		return 0;
	};

	/**
	 * Returns a printable string with this model's information.
	 * @method  toString
	 * @return {string} Printable string with this model's information.
	 */
	this.toString = function () {
		var str, s, t;

		str = "A\t";
		for ( s in this.states )
			str += this.states[ s ] + "\t";
		str += "\n";

		for ( s in this.states ) {
			str += this.states[ s ] + "\t";
			for ( t in this.states )
				str += this.tp( this.states[ s ], this.states[ t ] ) + "\t";
			str += "\n";
		}

		str += "\nB\t";
		for ( s in this.symbols )
			str += this.symbols[ s ] + "\t";
		str += "\n";

		for ( s in this.states ) {
			if ( this.states[  s ] === this.finalState ) continue;
			str += this.states[ s ] + "\t";
			for ( t in this.symbols )
				str += this.ep( this.states[ s ], this.symbols[ t ] ) + "\t";
			str += "\n";
		}

		str += "\nInitial:\n";
		for ( s in this.states )
			str += this.states[ s ] + ":\t" +
				this.ip( this.states[ s ] ) + "\n";
		str += "\nFinal: " + this.finalState;

		return str;
	};

	/**
	 * Prints a representation of this model.
	 * @method  print
	 */
	this.print = function () {
		console.log( this.toString() );
	};

	/**
	 * Adds given item to this HMM, training the model to properly classify it.
	 * @method  reestimate
	 * @param  {[[HMMSymbol]]} items Items used to reestimate this model.
	 */
	this.reestimate = function ( items ) {
		var initials = {},
			transitions = {},
			symbols = {},
			paths = [],
			path,
			transition,
			i, j, src, dst, prob, sum, item, sym;

		for ( i in items )
			paths.push( this.viterbi( items[ i ] ).path );

		this.finalState = 'F';
		this.transitionProbability = {};
		this.emissionProbability = {};

		for ( i in paths )
			if ( initials[ paths[ i ][ 0 ] ] )
				initials[ paths[ i ][ 0 ] ]++;
			else
				initials[ paths[ i ][ 0 ] ] = 1;

		for ( i in initials )
			this.initialProbability[ i ] = initials[ i ] / paths.length;

		sum = {};
		for ( i in paths ) {
			path = paths[ i ];
			item = items[ i ];
			for ( j = 0; j < path.length - 1; j++ ) {
				src = path[ j ];
				dst = path[ j + 1 ];
				if ( !sum[ src ] ) sum[ src ] = 0;
				sum[ src ]++;
				if ( !transitions[ src ] ) transitions[ src ] = {};
				if ( !transitions[ src ][ dst ] ) transitions[ src ][ dst ] = 0;
				transitions[ src ][ dst ]++;
				if ( !symbols[ src ] ) symbols[ src ] = {};
				if ( !symbols[ src ][ item[ j ] ] )
					symbols[ src ][ item[ j ] ] = 0;
				symbols[ src ][ item[ j ] ]++;
			}
		}

		for ( src in transitions ) {
			transition = transitions[ src ];
			for ( dst in transition ) {
				if ( !this.transitionProbability[ src ] )
					this.transitionProbability[ src ] = {};
				prob = transition[ dst ] / sum[ src ];
				this.transitionProbability[ src ][ dst ] = prob;
			}
			for ( sym in symbols[  src ] ) {
				if ( !this.emissionProbability[ src ] )
					this.emissionProbability[ src ] = {};
				if ( !this.emissionProbability[ src ][ sym ] )
					this.emissionProbability[ src ][ sym ] = 0;
				prob = symbols[ src ][ sym ] / sum[ src ];
				this.emissionProbability[ src ][ sym ] = prob;
			}
		}

	};

	/**
	 * Returns the Viterbi approximation to the probability of this model
	 * generating given item using the fastest implementation available.
	 * @private
	 * @method  viterbiApproximation
	 * @param  {[HMMSymbol]} item  Item whose generation probability will be
	 *                             returned.
	 * @return {Probability}       Viterbi approximation to the probability
	 *                             of this markov model generating given item.
	 */
	this.viterbiApproximation = function ( item ) {
		return this.viterbi( item ).probability;
	};

	/**
	 * Returns the Viterbi approximation to the probability of this model
	 * generating given item.
	 * @private
	 * @method  viterbiDynamic
	 * @param  {[HMMSymbol]} item  Item whose generation probability will be
	 *                             returned.
	 * @param  {[HMMState]}  state Optional. Initial state for computation.
	 *                             If no state is given then the most probable
	 *                             initial state is used.
	 * @return {Probability}       Viterbi approximation to the probability
	 *                             of this markov model generating given item.
	 */
	this.viterbi = function ( item ) {

		var V = [ {} ],
			path = {},
			max, i, j, state, calc, newpath, s;

		for ( i in this.states ) {
			state = this.states[ i ];
			V[ 0 ][ state ] = this.ip( state ) * this.ep( state, item[ 0 ] );
			path[ state ] = [ state ];
		}

		for ( var t = 1; t < item.length; t++ ) {
			V.push( {} );
			newpath = {};

			for ( i in this.states ) {
				state = this.states[ i ];
				max = [ 0, null ];
				for ( j in this.states ) {
					s = this.states[ j ];
					var tep = this.tp( s, state ) * this.ep( state, item[ t ] );
					calc = V[ t - 1 ][ s ] * tep;
					if ( calc >= max[ 0 ] ) max = [ calc, s ];
				}
				V[ t ][ state ] = max[ 0 ];
				newpath[ state ] = path[ max[ 1 ] ].concat( state );
			}
			path = newpath;
		}

		V.push( {} );
		newpath = {};

		max = [ 0, null ];
		for ( j = 0; j < this.states.length; j++ ) {
			s = this.states[ j ];
			calc = V[ t - 1 ][ s ] * this.tp( s, this.finalState );
			if ( calc >= max[ 0 ] ) max = [ calc, s ];
		}
		V[ item.length ][ state ] = max[ 0 ];
		path[ state ] = path[ max[ 1 ] ].concat( state );

		max = [ 0, null ];
		for ( i = 0; i < this.states.length; i++ ) {
			state = this.states[ i ];
			if ( V[ item.length ] ) calc = V[ item.length ][ state ];
			else calc = 0;
			if ( calc > max[ 0 ] ) max = [ calc, state ];
		}

		return {
			probability: max[ 0 ].toFixed( 6 ),
			path: path[ max[ 1 ] ]
		};
	};

	/**
	 * Returns the probability of this model generating given item.
	 * Please note that this method is much more expensive than the Viterbi
	 * Approximation and the results are similar.
	 * @private
	 * @method  forwardProbability
	 * @param  {[HMMSymbol]} item  Item whose generation probability will be
	 *                             returned.
	 * @param  {[HMMState]}  state Optional. Initial state for computation.
	 *                             If no state is given then the most probable
	 *                             initial state is used.
	 * @return {Probability}       Viterbi approximation to the probability
	 *                             of this markov model generating given item.
	 */
	this.forwardProbability = function ( item, state ) {
		var i,
			c,
			s = item[ 0 ],
			rest = item.slice( 1 ),
			probability = 0;

		if ( state === undefined )
			for ( i in this.initialProbability ) {
				c = this.ep( state, s ) * this.ip( state );
				if ( c < this.ep( i, s ) * this.ip( i ) )
					state = i;
			}

		if ( item.length === 1 )
			return this.ep( state, s ) * this.tp( state, this.finalState );

		for ( i in this.states ) {
			var tpp = this.tp( state, this.states[ i ] );
			var tpfp = this.forwardProbability( rest, this.states[ i ] );
			probability += tpp * tpfp;
		}

		return ( probability * this.ep( state, s ) ).toFixed( 6 );
	};

	/**
	 * Returns the probability that given item is generated by this model.
	 * @method generationProbability
	 * @uses   viterbyApproximation
	 * @param  {[HMMSymbol]} item Item whose generation probability will be
	 *                            returned.
	 * @return {Probability}      Probability that this model generates given
	 *                            item.
	 */
	this.generationProbability = function ( item ) {
		return this.viterbiApproximation( item );
	};

	/**
	 * Returns most probable sequence of states generating given item (if any).
	 * @param  {[HMMSymbol]} item Item whose optimal state sequence will be
	 *                            returned.
	 * @return {[HMMState]}       Optimal state sequence generating given item.
	 */
	this.optimalStateSequence = function ( item ) {
		return this.viterbi( item ).path;
	};

};