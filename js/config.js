'use strict';

var defaults = {
	'websocketServer': 'ws://127.0.0.1:8080',
	'websocketReplay': false,
	'bufferSize': 16384,
	'numChannels': 2
};

window.config = {
	'get': function(key, cb) {
		chrome.storage.sync.get('options', function(options) {
			cb(key ? (options.options[key] || defaults[key]) : Object.assign({ }, defaults, options.options));
		});
	},
	'set': function(options, cb) {
		window.config.get(null, function(opts) {
			chrome.storage.sync.set({ 'options': Object.assign({ }, opts, options) }, cb);
		});
	}
};