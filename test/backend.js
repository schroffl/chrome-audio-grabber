'use strict';

const WebSocketServer = require('ws').Server;
const wss = new WebSocketServer({ 'port': 1337 });

const Speaker = require('speaker');

wss.on('connection', sock => {
	let numChannels,
		speaker;

	console.log('Client connected');

	sock.on('message', data => {
		if(!speaker || !numChannels) {
			numChannels = data;

			speaker = new Speaker({
				'channels': numChannels,
				'sampleRate': 48000
			});

			return;
		} else {
			speaker.write(data);
		}
	});
});