//  Exposed globally so that Chrome Extension's foreground can access through chrome.extension.getBackgroundPage()
var RepeatButton = null;

define([
    'settings',
    'repeatButtonState'
], function (Settings, RepeatButtonState) {
    'use strict';

    var repeatButtonModel = Backbone.Model.extend({

        defaults: {
            //  TODO: This isn't entirely necessary anymore, but still might be nice to keep track of when a user reloads the program? Or is it expected that these reset then?
            //  Remember the initial state across sessions by writing to/from localStorage.
            state: Settings.get('repeatButtonState')
        },
        
        toggleRepeat: function () {

            var nextState = null;

            switch (this.get('state')) {
                case RepeatButtonState.DISABLED:
                    nextState = RepeatButtonState.REPEAT_VIDEO;
                    break;
                case RepeatButtonState.REPEAT_VIDEO:
                    nextState = RepeatButtonState.REPEAT_STREAM;
                    break;
                case RepeatButtonState.REPEAT_STREAM:
                    nextState = RepeatButtonState.DISABLED;
                    break;
                default:
                    console.error("Unhandled repeatButtonState:", this.state);
                    break;
            }

            this.set('state', nextState);
            Settings.set('repeatButtonState', nextState);
        }

    });

    RepeatButton = new repeatButtonModel;

    return RepeatButton;
});