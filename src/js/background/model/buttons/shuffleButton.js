define(function () {
    'use strict';
    
    var ShuffleButton = Backbone.Model.extend({

        defaults: {
            enabled: false
        },

        toggleEnabled: function () {
            this.set('enabled', !this.get('enabled'));
        }

    });

    //  Exposed globally so that the foreground can access the same instance through chrome.extension.getBackgroundPage()
    window.ShuffleButton = new ShuffleButton();
    return window.ShuffleButton;
});