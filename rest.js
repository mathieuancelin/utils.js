if(typeof jQuery === 'undefined') {
	throw 'jQuery is not available. Please add it to the current context.';
}
var REST = {} || REST;
(function(exports) {
	exports.namespace = "REST";
	exports.name = "REST Helper";
	exports.version = "1.0-SNAPSHOT";
	var check = function(url) {
		if (url.indexOf('/') > -1) {
			throw 'Cannot contains /';
		}
		return url;
	};
	var ajaxCall = function(url, method, data, async, d) {
		var debug = d || false;
		var mode = async ? 'async' : 'blocking';
		if (debug) console.info('Calling "%s" in %s mode ...', url, mode);
		var values = null;
		var call = $.ajax({
			url: url,
			async: async,
			data: data,
			dataType: 'json',
			type: method,
			error: function(xhr, status, error) { if (debug) console.error('Error while calling "%s" in %s mode, response with status "%s", error: %s', url, mode, status, error); },
			success: function(data, status, xhr) { 
				values = data;
				if (debug) console.info('Success calling "%s" in %s mode, response with status "%s"', url, mode, status); 
			},
			complete: function(xhr, status) { if (debug) console.info('Calling "%s" in %s mode done !', url, mode); }
		});
		if (async) {
			return call;
		} else {
			return values;
		}
	};
	var Resource = function(urlFrom, c, a, d) {
		var async = a || true;
		var collection = c || true;
		var debug = d || false;
		return {
			all: function(name) { return Resource(urlFrom + '/' + check(name), true, async, debug); },
			one: function(name, id) { return Resource(urlFrom + '/' + check(name) + '/' + check(id), false, async, debug); },
			custom: function(url) { return Resource(urlFrom + '/' + url, false, async, debug); },
			get: function(data) { return ajaxCall(urlFrom, 'GET', data, true, debug); },
			put: function(data) { return ajaxCall(urlFrom, 'PUT', data, true, debug); },
			post: function(data) { return ajaxCall(urlFrom, 'POST', data, true, debug); },
			delete: function(data) { return ajaxCall(urlFrom, 'DELETE', data, true, debug); },
			blocking: function() {
				get: function(data) {
					var values = ajaxCall(urlFrom, 'GET', data, false, debug);
					if (typeof values === 'object') {
						return values;
					}
					if (typeof values === 'string') {
						return values;
					}
					if (typeof values === 'array' && values.length > 1) {
						return values[0];
					}
					return null;
				},
				getList: function(data) {
					var values = ajaxCall(urlFrom, 'GET', data, false, debug);
					if (typeof values === 'object') {
						return [values];
					}
					if (typeof values === 'string') {
						return [values];
					}
					if (typeof values === 'array' && values.length > 1) {
						return values;
					}
					return [];
				},
				put: function(data) { return ajaxCall(urlFrom, 'PUT', data, false, debug); },
				post: function(data) { return ajaxCall(urlFrom, 'POST', data, false, debug); },
				delete: function(data) { return ajaxCall(urlFrom, 'DELETE', data, false, debug); }
			}
		};
	};
	exports.root = function(root, debug) {
		return Resource(root, true, false, debug);
	};
	var root = resource('/', true, false, false);
	exports.all = root.all;
	exports.one = root.one;
	exports.custom = root.custom;
	exports.get = root.get;
	exports.put = root.put;
	exports.post = root.post;
	exports.delete = root.delete;
	exports.blocking = root.blocking;
})(REST);