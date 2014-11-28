define([
    'background/enum/chromeCommand',
    'common/enum/repeatButtonState'
], function (ChromeCommand, RepeatButtonState) {
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
            
            chrome.commands.onCommand.addListener(this._onChromeCommandsCommand.bind(this));
        },
        
        toggleRepeatState: function () {
            var nextState = null;

            switch (this.get('state')) {
                case RepeatButtonState.Disabled:
                    nextState = RepeatButtonState.RepeatStream;
                    break;
                case RepeatButtonState.RepeatStream:
                    nextState = RepeatButtonState.RepeatSong;
                    break;
                case RepeatButtonState.RepeatSong:
                    nextState = RepeatButtonState.Disabled;
                    break;
                default:
                    console.error("Unhandled repeatButtonState:", this.state);
                    break;
            }

            this.save({
                state: nextState
            });
        },
        
        getStateMessage: function () {
            var message = '';
            switch (this.get('state')) {
                case RepeatButtonState.Disabled:
                    message = chrome.i18n.getMessage('repeatDisabled');
                    break;
                case RepeatButtonState.RepeatSong:
                    message = chrome.i18n.getMessage('repeatSongEnabled');
                    break;
                case RepeatButtonState.RepeatStream:
                    message = chrome.i18n.getMessage('repeatStreamEnabled');
            }
            
            return message;
        },

        _onChromeCommandsCommand: function (command) {
            if (command === ChromeCommand.ToggleRepeat) {
                this.toggleRepeatState();

                Streamus.channels.backgroundNotification.commands.trigger('show:notification', {
                    message: this.getStateMessage()
                });
            }
        }
    });

    return RepeatButton;
});