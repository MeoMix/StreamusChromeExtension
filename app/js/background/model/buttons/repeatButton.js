//  Exposed globally so that Chrome Extension's foreground can access through chrome.extension.getBackgroundPage()
var RepeatButton = null;

define([
    'repeatButtonState'
], function (RepeatButtonState) {
    'use strict';

    var repeatButtonModel = Backbone.Model.extend({

        defaults: {
            state: RepeatButtonState.Disabled
        },
        
        toggleRepeat: function () {

            var nextState = null;

            switch (this.get('state')) {
                case RepeatButtonState.Disabled:
                    nextState = RepeatButtonState.RepeatVideo;
                    break;
                case RepeatButtonState.RepeatVideo:
                    nextState = RepeatButtonState.RepeatStream;
                    break;
                case RepeatButtonState.RepeatStream:
                    nextState = RepeatButtonState.Disabled;
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