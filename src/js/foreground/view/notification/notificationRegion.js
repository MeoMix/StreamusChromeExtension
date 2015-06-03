define(function(require) {
  'use strict';

  var Notification = require('foreground/model/notification/notification');
  var NotificationView = require('foreground/view/notification/notificationView');

  var NotificationRegion = Marionette.Region.extend({
    initialize: function() {
      this.listenTo(StreamusFG.channels.notification.commands, 'show:notification', this._showNotification);
      this.listenTo(StreamusFG.backgroundChannels.notification.commands, 'show:notification', this._showNotification);
    },

    _showNotification: function(notificationOptions) {
      this.show(new NotificationView({
        model: new Notification(notificationOptions)
      }));
    }
  });

  return NotificationRegion;
});