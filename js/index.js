'use strict';

var config = window.config,
	capture = window.capture,
	captureModes = window.captureModes;

var current;

chrome.runtime.onMessage.addListener(function(action) {
	if(action !== 'startRecord')
		return;

	if(current)
		stopCapture();
	else {
		var mode = config.get('captureMode'),
			captureSettings = { 'bufferSize': config.get('bufferSize'), 'numChannels': config.get('numChannels') };

		var captureMode = captureModes[mode];

		Object.assign(captureSettings, config.captureModeSettings.get(mode));

		captureMode.init(captureSettings, function(onprocess, cleanup) {
			current = {	'cleanup': cleanup };

			chrome.tabCapture.capture({ 'audio': true }, function(stream) {
				current.captureData = capture.start(captureSettings, stream, onprocess);
			});
		}, stopCapture);
	}
});

function stopCapture() {
	if(!current)
		return;

	if(current.captureData)
		capture.stop(current.captureData);

	current.cleanup(function() {
		current = null;
	});
}