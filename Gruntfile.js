'use strict';

module.exports = function(grunt) {
	grunt.initConfig({
		'crx': {
			'publicExtension': {
				'src': [ 'js/*', 'ui/*', 'icon.png', 'manifest.json' ],
				'dest': 'dist/chrome-audio-grabber_public.zip'
			},
			'signedExtension': {
				'src': [ 'js/*', 'ui/*', 'icon.png', 'manifest.json' ],
				'dest': 'dist/chrome-audio-grabber_signed.crx',
				'options': {
					'privateKey': '../chrome-audio-grabber.pem'
				}
			}
		}
	});

	grunt.loadNpmTasks('grunt-crx');

	grunt.registerTask('default', [ 'crx' ]);
};