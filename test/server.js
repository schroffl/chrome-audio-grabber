'use strict';

const url = require('url');
const qs = require('querystring');

const WebSocketServer = require('ws').Server;
const wss = new WebSocketServer({ 'port': parseInt(process.argv[2]) || 8080 });

const Speaker = require('speaker');

wss.on('connection', sock => {
	let hsData = qs.parse( url.parse(sock.upgradeReq.url).query ),
		numChannels = hsData.numChannels,
		bufferSize = hsData.bufferSize;

	let speaker = new Speaker({
		'channels': hsData.numChannels,
		'sampleRate': 48000
	});

	console.log('Client connected');

	sock.on('message', data => {
		let channels = [ ], audioData = new Buffer(data.length), // Buffer.allocUnsafe is probably better for node version > 6
			chunkSize = bufferSize * 2;
 	
		for(let i=0; i<data.length; i+=chunkSize)
			channels.push(data.slice(i, i + chunkSize));

		for(let i=0; i<data.length; i+=2) {
			let channel = i / 2 % numChannels,
				sample = i / numChannels - channel;

			// console.log('Reading the', sample + 'th sample of channel', channel);

			audioData.writeInt16LE(channels[channel].readInt16LE(sample), i);
		}

		speaker.write(audioData);
	}).on('close', () => 
		console.log('Client disconnected') );
});