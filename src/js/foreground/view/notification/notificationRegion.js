define([
	'common/enum/notificationType',
	'foreground/model/notification',
	'foreground/view/notification/notificationView'
], function (NotificationType, Notification, NotificationView) {
	'use strict';

	var NotificationRegion = Backbone.Marionette.Region.extend({
	    el: '#foregroundArea-notificationRegion',
	    hideTimeout: null,
	    hideTimeoutDelay: 3000,

		initialize: function () {
		    this.listenTo(Streamus.channels.notification.commands, 'show:notification', this._showNotification);
		    this.listenTo(Streamus.backgroundChannels.notification.commands, 'show:notification', this._showNotification);
		},

		_showNotification: function (notificationOptions) {
			var notificationView = new NotificationView({
				model: new Notification(notificationOptions)
			});
		    
			this.listenTo(notificationView, 'hide:notification', this._hideNotification);
			this.show(notificationView);
			this._setHideTimeout();
			this.$el.addClass('is-visible');
		},
		
		onSwap: function () {
		    //  Timeout will go rogue when swapping views because empty is called without _hideNotification being called.
		    this._clearHideTimeout();
		},
		
		_setHideTimeout: function () {
		    //this.hideTimeout = setTimeout(this._hideNotification.bind(this), this.hideTimeoutDelay);
		},
	    
		_clearHideTimeout: function () {
		    clearTimeout(this.hideTimeout);
		},
		
		_hideNotification: function () {
		    this._clearHideTimeout();
		    this.$el.off('webkitTransitionEnd').one('webkitTransitionEnd', this._onTransitionOutComplete.bind(this));
		    this.$el.removeClass('is-visible');
		},
		
        _onTransitionOutComplete: function () {
            this.empty();
        }
	});

	return NotificationRegion;
});