define(function (require) {
    'use strict';

    var NotificationTemplate = require('text!template/notification/notification.html');

	var NotificationView = Marionette.ItemView.extend({
		id: 'notification',
		className: 'notification panel-content panel-content--fadeInOut',
		template: _.template(NotificationTemplate),

		ui: function () {
			return {
				hideButton: '#' + this.id + '-hideButton'
			};
		},

		events: {
			'click @ui.hideButton': '_onClickHideButton'
		},
		
		_onClickHideButton: function() {
			Streamus.channels.notification.commands.trigger('hide:notification');
		}
	});

	return NotificationView;
});