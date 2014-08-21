define([
	'foreground/enum/notificationType',
	'foreground/model/notification',
	'foreground/view/notification/notificationView'
], function (NotificationType, Notification, NotificationView) {
	'use strict';

	var NotificationRegion = Backbone.Marionette.Region.extend({
	    //  TODO: I am required to use ID selector here until bug resolved: https://github.com/marionettejs/backbone.marionette/issues/1530
		el: '#notification-region',

		initialize: function () {
			this.listenTo(Backbone.Wreqr.radio.channel('notification').commands, 'show', this._showNotification);
			//  TODO: Need to listen to background application triggering errors and build notifications from them
		},

		_showNotification: function (notification) {
			var notificationView = new NotificationView({
				model: notification
			});

			this.show(notificationView);
		}
	});

	return NotificationRegion;
});