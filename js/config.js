'use strict';

var config = window.config = {
	'get': function(key) {
		var value = Lockr.get(key);

		if(value)
			return value;

		if(key in config.defaults) {
			config.set(key, config.defaults[key]);
			return Lockr.get(key);
		}
	},
	'set': function(key, val) {
		Lockr.set(key, val);
	},
	'defaults': {
		'bufferSize': 16384,
		'numChannels': 2,
		'captureMode': 'playback',
		'captureModeSettings': { }
	},
	'captureModeSettings': {
		'get': function(mode, key) {
			var cmSettings = config.get('captureModeSettings');

			if(!cmSettings.hasOwnProperty(mode))
				cmSettings[mode] = { };

			if(!key)
				return cmSettings[mode];

			return cmSettings[mode][key];
		},
		'set': function(mode, key, value) {
			var cmSettings = config.get('captureModeSettings');

			if(!cmSettings.hasOwnProperty(mode))
				cmSettings[mode] = { };

			cmSettings[mode][key] = value;
			Lockr.set('captureModeSettings', cmSettings);
		}
	}
};