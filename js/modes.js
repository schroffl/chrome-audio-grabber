'use strict';

var captureModes = window.captureModes = { }
	config = window.config;

/**
 * Simply pipe input to output
 */
captureModes.playback = {
	'init': function(captureSettings, startCapture) {
		var bufferSize = captureSettings.bufferSize,
			numChannels = captureSettings.numChannels;

		startCapture(function(e) {
			var input = e.inputBuffer,
				output = e.outputBuffer;

			for(var channel=0; channel<numChannels; channel++)
				output.getChannelData(channel).set(input.getChannelData(channel));
		}, function(done) {
			done();
		});
	},
	'name': 'Playback'
};

/**
 * Stream captured data via a websocket
 */
captureModes.websocket = {
	'init': function(captureSettings, startCapture, stopCapture) {
		var bufferSize = captureSettings.bufferSize,
			numChannels = captureSettings.numChannels,
			websocketURL = captureSettings.websocketURL;

		var ws = new WebSocket(websocketURL + '?numChannels=' + numChannels + '&bufferSize=' + bufferSize);

		ws.onclose = stopCapture;

		ws.onopen = function() {
			startCapture(function(e) {
				var input = e.inputBuffer,
					output = e.outputBuffer,
					data = new Float32Array(bufferSize * numChannels);

				for(var channel=0; channel<numChannels; channel++) {
					var inputData = input.getChannelData(channel);

					data.set(inputData, bufferSize * channel);
					// output.getChannelData(channel).set(inputData);
				}

				data = Float32ToInt16(data);

				ws.send(data);
			}, function(done) {
				ws.close();
				done();
			});
		}
	},
	'name': 'Stream Via WebSocket',
	'settings': {
		'websocketURL': {
			'name': 'WebSocket URL',
			'type': 'text',
			'default': 'ws://127.0.0.1:8080'
		}
	}
};

function Float32ToInt16(buffer) {
	var len = buffer.length,
		buf = new Int16Array(buffer.length);

	for(var i=0; i<len; i++)
		buf[i] = buffer[i] * 0x7FFF;

	return buf;
}

// Initialize capture mode settings
var cmSettings = config.get('captureModeSettings');

for(var mode in captureModes)
	for(var option in captureModes[mode].settings)
		if(!(mode in cmSettings) || !(option in cmSettings[mode]))
			config.captureModeSettings.set(mode, option, captureModes[mode].settings[option].default);	