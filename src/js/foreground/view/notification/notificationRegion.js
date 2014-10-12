define([
	'common/enum/notificationType',
	'foreground/model/notification',
	'foreground/view/notification/notificationView'
], function (NotificationType, Notification, NotificationView) {
	'use strict';

	var NotificationRegion = Backbone.Marionette.Region.extend({
		el: '#foregroundArea-notificationRegion',

		initialize: function () {
			this.listenTo(Backbone.Wreqr.radio.channel('notification').commands, 'show:notification', this._showNotification);
			this.listenTo(Streamus.backgroundPage.Backbone.Wreqr.radio.channel('notification').commands, 'show:notification', this._showNotification);
			//  TODO: Need to listen to background application triggering errors and build notifications from them
		},

		_showNotification: function (notificationOptions) {
			var notificationView = new NotificationView({
				model: new Notification(notificationOptions)
			});

			this.show(notificationView);
		}
	});

	return NotificationRegion;
});