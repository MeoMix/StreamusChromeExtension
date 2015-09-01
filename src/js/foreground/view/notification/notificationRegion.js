'use strict';
import {Region} from 'marionette';
import Notification from 'foreground/model/notification/notification';
import NotificationView from 'foreground/view/notification/notificationView';

var NotificationRegion = Region.extend({
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

export default NotificationRegion;