'use strict';

var config = window.config,
	options,
	currentStreamData,
	ws;

chrome.browserAction.onClicked.addListener(function() {
	config.get(null, function(opts) {
		options = opts;

		chrome.tabs.getSelected(null, function(tab) {
			console.log('Currently Recording:', currentStreamData ? currentStreamData.tabId : null, '-- Next:', tab.id);

			if(currentStreamData && currentStreamData.tabId === tab.id)
				return stopCapture();
			else if(currentStreamData)
				stopCapture();

			ws = new WebSocket(options.websocketServer);
			ws.binaryType = 'arraybuffer';

			// NOTE: For testing purposes
			if(options.websocketReplay) ws.onmessage = playAudio;

			ws.onopen = startCapture.bind(null, options.bufferSize, options.numChannels, tab.id);
			ws.onclose = stopCapture;
		});
	});
});

function startCapture(bufferSize, numChannels, tabId) {
	console.log('Started capturing with settings', { 'bufferSize': bufferSize, 'numChannels': numChannels });

	chrome.tabCapture.capture({ 'audio': true }, function(stream) {
		var ctx = new AudioContext(),
			source = ctx.createMediaStreamSource(stream),
			proc = ctx.createScriptProcessor(bufferSize, numChannels, numChannels);

		proc.onaudioprocess = function(e) {
			var input = e.inputBuffer,
				output = e.outputBuffer;

			var wsData = new Float32Array(proc.bufferSize * numChannels + 4);

			wsData.set(Float32Array.from([ numChannels ]));

			for(var channel=0; channel<numChannels; channel++) {
				var iData = input.getChannelData(channel),
					oData = output.getChannelData(channel);

				wsData.set(iData, channel * proc.bufferSize + 4);

				// Only directly pipe the sound if it's not already being played over the websocket
				if(!options.websocketReplay) oData.set(iData);
			}

			ws.send(wsData);
		}

		source.connect(proc);
		proc.connect(ctx.destination);

		currentStreamData = {
			'stream': stream,
			'audioContext': ctx,
			'tabId': tabId
		};
	});
}

function stopCapture() {
	console.log('Stopped capturing');

	if(ws) {
		ws.onclose = null;
		ws.close();
	}

	if(currentStreamData) {
		currentStreamData.stream.getAudioTracks()[0].stop();
		currentStreamData.audioContext.close();
	}

	ws = null;
	currentStreamData = null;
}

// NOTE: For testing purposes
var aContext = new AudioContext();

function playAudio(data) {
	var audio = new Float32Array(data.data),
		numChannels = audio[0],

	audio = audio.slice(4);

	var bufferSize = audio.length / numChannels,
		source = aContext.createBufferSource(),
		audioBuffer = aContext.createBuffer(numChannels, bufferSize, 48000);

	for(var channel=0; channel<numChannels; channel++)
		audioBuffer.getChannelData(channel).set(audio.slice(channel * bufferSize, channel * bufferSize + bufferSize));

	source.buffer = audioBuffer;
	source.connect(aContext.destination);
	source.start(0);
}