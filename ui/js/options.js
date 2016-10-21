'use strict';

var config = window.config;

$(function() {
	$('[data-link]').each(function() {
		var option = $(this).data('link');

		config.get(option, function(value) {
			var type = $(this).attr('type');

			if(type == 'checkbox')
				$(this).prop('checked', value);
			else
				$(this).val(value);
		}.bind(this));

		$(this).on('change', function() {
			var obj = { },
				type = $(this).attr('type');

			obj[option] = type !== 'checkbox' ? $(this).val() : $(this).prop('checked');

			config.set(obj, console.log);
		});
	});
});