define([
    'common/enum/repeatButtonState'
], function (RepeatButtonState) {
    'use strict';

    //  If the foreground requests, don't instantiate -- return existing from the background.
    if (!_.isUndefined(chrome.extension.getBackgroundPage().window.RepeatButton)) {
        return chrome.extension.getBackgroundPage().window.RepeatButton;
    }

    var RepeatButton = Backbone.Model.extend({

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

    //  Exposed globally so that the foreground can access the same instance through chrome.extension.getBackgroundPage()
    window.RepeatButton = new RepeatButton();
    return window.RepeatButton;
});