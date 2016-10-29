'use strict';

var config = window.config,
	capture = window.capture,
	captureModes = window.captureModes;

var current;

chrome.browserAction.onClicked.addListener(function() {
	if(current)
		stopCapture();
	else {
		var mode = config.get('captureMode'),
			captureSettings = { 'bufferSize': config.get('bufferSize'), 'numChannels': config.get('numChannels') },
			captureMode = captureModes[mode];

		Object.assign(captureSettings, config.captureModeSettings.get(mode));

		function startCapture(onprocess, cleanup) {
			current = {	'cleanup': cleanup };

			chrome.tabs.query({ 'active': true, 'currentWindow': true }, function(tabs) {
				chrome.tabCapture.capture({ 'audio': true }, function(stream) {
					current.captureData = capture.start(captureSettings, stream, onprocess);
					current.tabID = tabs.shift().id;

					updateStatus(true, current.tabID);
				});
			});
		}

		captureMode.init(captureSettings, startCapture, stopCapture);
	}
});

function stopCapture(err) {
	if(!current)
		return;

	if(current.captureData)
		capture.stop(current.captureData);

	current.cleanup(function() {
		updateStatus(false, current.tabID);
		
		current = null;

		if(err)
			throw err;
	});
}

function updateStatus(recording, tabID) {
	chrome.browserAction.setBadgeBackgroundColor({ 'color': recording ? '#FF0000' : '#4285F4', 'tabId': tabID });
	chrome.browserAction.setBadgeText({ 'text': recording ? 'REC' : '' });
}