define([
    'foreground/model/foregroundViewManager',
    'text!template/notification.html'
], function (ForegroundViewManager, NotificationTemplate) {
    'use strict';

    var NotificationView = Backbone.Marionette.ItemView.extend({

        className: 'notification',

        template: _.template(NotificationTemplate),
        
        initialize: function() {
            ForegroundViewManager.subscribe(this);
        }

    });

    return NotificationView;
});