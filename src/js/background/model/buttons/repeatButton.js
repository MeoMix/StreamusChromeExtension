define([
    'common/enum/repeatButtonState'
], function (RepeatButtonState) {
    'use strict';

    var RepeatButton = Backbone.Model.extend({
        localStorage: new Backbone.LocalStorage('RepeatButton'),
        
        defaults: {
            //  Need to set the ID for Backbone.LocalStorage
            id: 'RepeatButton',
            state: RepeatButtonState.Disabled
        },
        
        initialize: function () {
            //  Load from Backbone.LocalStorage
            this.fetch();
        },
        
        toggleRepeatState: function () {
            var nextState = null;

            switch (this.get('state')) {
                case RepeatButtonState.Disabled:
                    nextState = RepeatButtonState.RepeatSong;
                    break;
                case RepeatButtonState.RepeatSong:
                    nextState = RepeatButtonState.RepeatStream;
                    break;
                case RepeatButtonState.RepeatStream:
                    nextState = RepeatButtonState.Disabled;
                    break;
                default:
                    console.error("Unhandled repeatButtonState:", this.state);
                    break;
            }

            this.save({
                state: nextState
            });
        }
    });

    //  Exposed globally so that the foreground can access the same instance through chrome.extension.getBackgroundPage()
    window.RepeatButton = new RepeatButton();
    return window.RepeatButton;
});