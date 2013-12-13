define([
    'genericForegroundView',
    'text!../template/notification.htm'
], function (GenericForegroundView, NotificationTemplate) {
    'use strict';

    var NotificationView = GenericForegroundView.extend({

        className: 'notification',

        template: _.template(NotificationTemplate),
        
        text: '',
        
        render: function () {

            this.$el.html(this.template({
                text: this.text
            }));

            return this;
        },
        
        initialize: function(options) {
            this.text = options.text;
            
            if ($.trim(this.text) === '') {
                throw "NotificationView expects to be initialized with text";
            }
        }

    });

    return NotificationView;
});