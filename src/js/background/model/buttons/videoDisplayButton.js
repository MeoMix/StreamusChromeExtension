define(function () {
    'use strict';

    var VideoDisplayButton = Backbone.Model.extend({

        defaults: {
            enabled: false
        },
        
        toggleEnabled: function () {
            this.set('enabled', !this.get('enabled'));
            console.log("I am now:", this.get('enabled'));
        },
        
        //  TODO: Implement toggle on/off video via keyboard shortcut.
        toggleVideoDisplay: function() {
            console.error('not implemented');
        }

    });
    
    //  Exposed globally so that the foreground can access the same instance through chrome.extension.getBackgroundPage()
    window.VideoDisplayButton = new VideoDisplayButton();
    return window.VideoDisplayButton;
});