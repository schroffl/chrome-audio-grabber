'use strict';

var config = window.config,
	captureModes = window.captureModes;

$(function() {
	for(var mode in captureModes) {
		var name = mode;

		$('select[name=captureModes]').append('<option value="' + mode + '">' + name + '</option>');
	}

	$('[data-link]').each(function() {
		var option = $(this).data('link'),
			type = $(this).attr('type'),
			value = config.get(option);

		if(type === 'checkbox')
			$(this).prop('checked', value);
		else
			$(this).val(value);

		$(this).on('change', function() {
			var newValue;

			if(type === 'checkbox')
				newValue = $(this).prop('checked');
			else
				newValue = $(this).val();

			config.set(option, newValue);
		});
	});

	$('[data-background-action]').on('click', function() {
		var action = $(this).data('background-action');

		chrome.runtime.sendMessage(action);
	});

	$('[data-link=captureMode]').on('change', function() {
		loadCaptureModeSettings($(this).val());
	});

	loadCaptureModeSettings(config.get('captureMode'));
});

function loadCaptureModeSettings(mode) {
	var cmSettingsMeta = captureModes[mode].settings;

	$('#cmSettingsContainer').empty();

	for(var option in cmSettingsMeta) {
		var value = config.captureModeSettings.get(mode, option) || cmSettingsMeta[option].default,
			name = cmSettingsMeta[option].name,
			type = cmSettingsMeta[option].type;

		var label = $('<label></label>'),
			input = $('<input>');

		label.attr('for', mode + '.' + option);
		label.html(name);

		input.attr('name', mode + '.' + option);
		input.attr('type', type);
		input.val(config.captureModeSettings.get(mode, option));
		input.addClass('form-control');

		input.on('change', function() {
			config.captureModeSettings.set(mode, option, $(this).val());
		});

		$('#cmSettingsContainer').append(label);
		$('#cmSettingsContainer').append(input);
	}
}