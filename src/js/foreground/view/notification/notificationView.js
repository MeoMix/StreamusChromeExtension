define([
	'text!template/notification/notification.html'
], function (NotificationTemplate) {
	'use strict';

	var NotificationView = Marionette.ItemView.extend({
		id: 'notification',
		className: 'notification',
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