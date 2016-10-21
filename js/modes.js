'use strict';

var captureModes = window.captureModes = { }
	config = window.config;

/**
 * Simply pipe input to output
 */
captureModes.playback = function(captureSettings, startCapture) {
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
};

/**
 * Stream capture data via a websocket
 */
captureModes.websocket = function(captureSettings, startCapture, stopCapture) {
	var bufferSize = captureSettings.bufferSize,
		numChannels = captureSettings.numChannels,
		websocketURL = config.get('websocketURL');

	var ws = new WebSocket(websocketURL);

	ws.onclose = stopCapture;

	ws.onopen = function() {
		ws.send(numChannels);

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
	};
};

function Float32ToInt16(buffer) {
	var len = buffer.length,
		buf = new Int16Array(buffer.length);

	for(var i=0; i<len; i++)
		buf[i] = buffer[i] * 0x8000;

	return buf.buffer;
}