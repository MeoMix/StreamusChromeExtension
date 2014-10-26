define([
	'common/enum/notificationType',
	'foreground/model/notification',
	'foreground/view/notification/notificationView'
], function (NotificationType, Notification, NotificationView) {
	'use strict';

	var NotificationRegion = Backbone.Marionette.Region.extend({
		el: '#foregroundArea-notificationRegion',

		initialize: function () {
		    this.listenTo(Streamus.channels.notification.commands, 'show:notification', this._showNotification);
		    this.listenTo(Streamus.backgroundChannels.notification.commands, 'show:notification', this._showNotification);

		    //setTimeout(function() {
		    //    this._showNotification({
		    //        type: NotificationType.Success,
		    //        message: 'hello!'
		    //    });
		    //}.bind(this), 200);
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