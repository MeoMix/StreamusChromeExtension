define(function(require) {
  'use strict';

  var Notification = require('foreground/model/notification/notification');
  var NotificationView = require('foreground/view/notification/notificationView');

  var NotificationRegion = Marionette.Region.extend({
    initialize: function() {
      this.listenTo(Streamus.channels.notification.commands, 'show:notification', this._showNotification);
      this.listenTo(Streamus.backgroundChannels.notification.commands, 'show:notification', this._showNotification);
    },

    _showNotification: function(notificationOptions) {
      this.show(new NotificationView({
        model: new Notification(notificationOptions)
      }));
    }
  });

  return NotificationRegion;
});