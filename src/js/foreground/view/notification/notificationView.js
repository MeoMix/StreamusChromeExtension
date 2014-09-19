define([
	'foreground/enum/notificationType',
	'text!template/notification.html'
], function (NotificationType, NotificationTemplate) {
	'use strict';

	var NotificationView = Backbone.Marionette.ItemView.extend({
	    id: 'notification',
		className: function () {
			return this._getClassName();
		},
		template: _.template(NotificationTemplate),

		events: {
			'click @ui.hideButton': '_hide'
		},
		
		ui: {
		    hideButton: '#notification-hideButton'
        },

		transitionDelay: 200,
		hideTimeout: null,
		hideTimeoutDelay: 3000,

		onShow: function () {
			this.$el.transition({
				y: 0,
				opacity: 1
			}, this.transitionDelay, 'snap');

			this._setHideTimeout();
		},

		_hide: function () {
			this._clearHideTimeout();

			this.$el.transition({
				y: -1 * this.$el.height(),
				opacity: 0
			}, this.transitionDelay, this.destroy.bind(this));
		},

		_setHideTimeout: function () {
			this.hideTimeout = setTimeout(this._hide.bind(this), this.hideTimeoutDelay);
		},

		_clearHideTimeout: function () {
			clearTimeout(this.hideTimeout);
		},

		//  Dynamically determine the class name of the view in order to style it based on the type of notification
		_getClassName: function () {
			var className = 'panel notification ';

			var notificationType = this.model.get('type');
			switch (notificationType) {
				case NotificationType.Success:
					className += 'notification--success';
					break;
				case NotificationType.Error:
					className += 'notification--error';
					break;
			}

			return className;
		}
	});

	return NotificationView;
});