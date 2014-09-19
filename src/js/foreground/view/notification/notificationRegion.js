define([
	'foreground/enum/notificationType',
	'foreground/model/notification',
	'foreground/view/notification/notificationView'
], function (NotificationType, Notification, NotificationView) {
	'use strict';

	var NotificationRegion = Backbone.Marionette.Region.extend({
		el: '#notificationRegion',

		initialize: function () {
			this.listenTo(Backbone.Wreqr.radio.channel('notification').commands, 'show', this._showNotification);
		    //  TODO: Need to listen to background application triggering errors and build notifications from them

		    this._showNotification(new Notification({
		        type: NotificationType.Success,
		        text: 'Hello, world'
		    }));
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