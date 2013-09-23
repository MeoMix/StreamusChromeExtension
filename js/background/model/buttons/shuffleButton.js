//  Exposed globally so that Chrome Extension's foreground can access through chrome.extension.getBackgroundPage()
var ShuffleButton = null;

define([
    'settings'
], function (Settings) {
    'use strict';

    var shuffleButtonModel = Backbone.Model.extend({

        defaults: {
            //  TODO: This isn't entirely necessary anymore, but still might be nice to keep track of when a user reloads the program? Or is it expected that these reset then?
            //  Remember the initial state across sessions by writing to/from localStorage.
            enabled: Settings.get('shuffleEnabled')
        },

        //  TODO: Consider debouncing here, too.
        toggleShuffle: function () {
            
            this.set('enabled', !this.get('enabled'));
            Settings.set('shuffleEnabled', this.get('enabled'));
        }

    });

    ShuffleButton = new shuffleButtonModel;

    return ShuffleButton;
});