define([
    'text!template/notification.html'
], function (NotificationTemplate) {
    'use strict';

    var NotificationView = Backbone.Marionette.ItemView.extend({
        className: 'notification',
        template: _.template(NotificationTemplate)
    });

    return NotificationView;
});