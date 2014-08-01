define([
    'foreground/enum/notificationType',
    'text!template/notification.html'
], function(NotificationType, NotificationTemplate) {
    'use strict';

    var NotificationView = Backbone.Marionette.ItemView.extend({
        className: function() {
            return this._getClassName();
        },
        template: _.template(NotificationTemplate),
        
        events: {
            'click .remove': '_hide'
        },
        
        onShow: function () {
            this.$el.transition({
                y: 0,
                opacity: 1
            }, 250, 'snap');
        },
        
        _hide: function () {
            this.$el.transition({
                y: -1 * this.$el.height(),
                opacity: 0
            }, 250, this.destroy.bind(this));
        },

        //  Dynamically determine the class name of the view in order to style it based on the type of notification
        _getClassName: function () {
            var className = 'notification ';

            var notificationType = this.model.get('type');
            switch (notificationType) {
                case NotificationType.Success:
                    className += 'success';
                    break;
                case NotificationType.Error:
                    className += 'error';
                    break;
            }

            return className;
        }
    });

    return NotificationView;
})