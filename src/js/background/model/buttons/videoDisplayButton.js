define([
    'background/collection/streamItems'
], function (StreamItems) {
    'use strict';

    var VideoDisplayButton = Backbone.Model.extend({

        defaults: {
            //  TODO: rename enabled to 'active' or 'clicked' or something
            enabled: false,
            //  disabled is whether the action is allowed to happen or not.
            disabled: true
        },

        initialize: function () {
            this.listenTo(StreamItems, 'add addMultiple remove reset', this.setDisabled);
        },
        
        setDisabled: function () {
            this.set('disabled', StreamItems.length === 0);
        },
        
        toggleEnabled: function () {
            this.set('enabled', !this.get('enabled'));
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