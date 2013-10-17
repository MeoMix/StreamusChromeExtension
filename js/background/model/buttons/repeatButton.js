//  Exposed globally so that Chrome Extension's foreground can access through chrome.extension.getBackgroundPage()
var RepeatButton = null;

define([
    'repeatButtonState'
], function (RepeatButtonState) {
    'use strict';

    var repeatButtonModel = Backbone.Model.extend({

        defaults: {
            state: RepeatButtonState.DISABLED
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
        }

    });

    RepeatButton = new repeatButtonModel;

    return RepeatButton;
});