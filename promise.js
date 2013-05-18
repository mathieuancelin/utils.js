var Promise = function() {
	var done = false;
	var callbacks = [];
	var promiseValue = null;
	var apply = function(value) {
		promiseValue = value;
		if (callbacks.length > 0) {
			callbacks.forEach(function(item) {
				if(typeof item === 'function') {
					item(value);
				}
			});
		}
		done = true;
	};
	var onRedeem = function(closure) {
		if(typeof closure === 'function') {
			if (done) {
				closure(promiseValue);
			} else {
				callbacks.push(closure);
			}
		}
		return this;
	};
	var isDone = function() {
		return done;
	};
	var notDone = function() {
		return !done;
	};
	var get = function() {
		return promiseValue;
	};
	var map = function(closure) {
		var promise = new Promise();
		if (typeof closure === 'function') {
			onRedeem(function(value) {
				promise.apply(closure(promiseValue));
			});
		}
		return promise;
	};
	var flatMap = function(closure) {
		var promise = new Promise();
		if (typeof closure === 'function') {
			onRedeem(function(value) {
				var p2 = closure(promiseValue);
				p2.onRedeem(function(value2) {
					promise.apply(value2);
				});
			});
		}
		return promise;
	};
	var filter = function(predicate) {
		var promise = new Promise();
		if (typeof predicate === 'function') {
			onRedeem(function(value) {
				if (predicate(promiseValue)) {
					promise.apply(promiseValue);
				}
			});
		}
		return promise;
	};
	var filterNot = function(predicate) {
		var promise = new Promise();
		if (typeof predicate === 'function') {
			onRedeem(function(value) {
				if (!predicate(promiseValue)) {
					promise.apply(promiseValue);
				}
			});
		}
		return promise;
	};
	var then = map;
	var andThen = flatMap;
	return {
		apply: apply,
		onRedeem: onRedeem,
		isDone: isDone,
		get: get,
		map: map,
		flatMap: flatMap,
		filter: filter,
		filterNot: filterNot,
		notDone: notDone,
		then: then,
		andThen: andThen	
	};
};	
Promise.map = function() {
	var finalPromise = new Promise();
	if(typeof arguments !== 'undefined') {
		var promises = [];
		for (var i = 0; i < arguments.length; i++) {
			promises.push(arguments[i]);
		}
		var results = [];
		var count = promises.length;
		promises.forEach(function(promise) {
			if (typeof promise.onRedeem === 'function') {
				promise.onRedeem(function(result) {
					results.push(result);
					count--;
					if (count <= 0) {
						finalPromise.apply(results);
					}
				});
			}
		});
	}
	return finalPromise;
};