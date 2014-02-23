define(function() {
    'use strict';

    var Notification = Backbone.Model.extend({
        defaults: {
            text: ''
        },
        
        initialize: function() {
            
            if ($.trim(this.get('text')) === '') {
                throw "Notification expects to be initialized with text";
            }

        }
    });

    return Notification;
})