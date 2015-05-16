define(function(require) {
    'use strict';

    var NotificationTemplate = require('text!template/notification/notification.html');

    var NotificationView = Marionette.ItemView.extend({
        id: 'notification',
        className: 'notification panel-content panel-content--fadeInOut',
        template: _.template(NotificationTemplate)
    });

    return NotificationView;
});