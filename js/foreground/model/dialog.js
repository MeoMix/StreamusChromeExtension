define(function () {
    'use strict';

    var Dialog = Backbone.Model.extend({

        defaults: function () {
            return {
                text: ''
            };
        }
        
    });

    return Dialog;
});