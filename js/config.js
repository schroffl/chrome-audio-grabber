'use strict';

var config = window.config = {
	'get': function(key) {
		if(!key)
			return Object.assign({ }, config.defaults, localStorage);

		if(key in localStorage)
			return localStorage[key];

		if(key in config.defaults)
			return config.defaults[key];

		return null;
	},
	'set': function(key, val) {
		localStorage[key] = val;
	},
	'defaults': {
		'bufferSize': 16384,
		'numChannels': 2,
		'captureMode': 'playback',
		'websocketURL': 'ws://127.0.0.1:8080'
	}
};