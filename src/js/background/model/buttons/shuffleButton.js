define(function () {
    'use strict';
    
    var ShuffleButton = Backbone.Model.extend({
        localStorage: new Backbone.LocalStorage('ShuffleButton'),
        
        defaults: {
            //  Need to set the ID for Backbone.LocalStorage
            id: 'ShuffleButton',
            enabled: false
        },
        
        initialize: function () {
            //  Load from Backbone.LocalStorage
            this.fetch();
        },

        toggleEnabled: function () {
            this.save({
                enabled: !this.get('enabled')
            });
        }
    });

    //  Exposed globally so that the foreground can access the same instance through chrome.extension.getBackgroundPage()
    window.ShuffleButton = new ShuffleButton();
    return window.ShuffleButton;
});