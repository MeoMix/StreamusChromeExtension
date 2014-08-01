define([
    'foreground/enum/notificationType'
], function (NotificationType) {
    'use strict';

    var Notification = Backbone.Model.extend({
        defaults: {
            type: NotificationType.None,
            text: ''
        },
        
        initialize: function() {
            this._ensureType();
        },
        
        _ensureType: function() {
            var type = this.get('type');
            
            if (type === NotificationType.None) {
                throw new Error('Notification expects to be initialized with a NotificationType');
            }
        }
    });

    return Notification;
});