define([
	'common/enum/notificationType',
	'text!template/notification/notification.html'
], function (NotificationType, NotificationTemplate) {
	'use strict';

	var NotificationView = Backbone.Marionette.ItemView.extend({
		id: 'notification',
		className: function () {
			return this._getClassName();
		},
		template: _.template(NotificationTemplate),

		ui: {
		    hideButton: '#notification-hideButton'
		},

		triggers: {
			'click @ui.hideButton': 'hide:notification'
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
			    case NotificationType.Warning:
			        className += 'notification--warning';
			        break;
			}

			return className;
		}
	});

	return NotificationView;
});