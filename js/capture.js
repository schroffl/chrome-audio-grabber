'use strict';

window.capture = {
	'start': function(options, stream, onprocess) {
		console.log('Started capturing stream', stream, 'with settings', options);

		var numChannels = options.numChannels,
			bufferSize = options.bufferSize;

		var ctx = new AudioContext(),
			source = ctx.createMediaStreamSource(stream),
			proc = ctx.createScriptProcessor(bufferSize, numChannels, numChannels);

		proc.onaudioprocess = onprocess;

		source.connect(proc);
		proc.connect(ctx.destination);

		return {
			'stream': stream,
			'audioContext': ctx
		};
	},
	'stop': function(captureData) {
		console.log('Stopped capturing stream', captureData.stream);

		captureData.stream.getAudioTracks()[0].stop();
		captureData.audioContext.close();
	}
};