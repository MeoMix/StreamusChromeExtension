define(function (require) {
    'use strict';

    var ChromeCommand = require('background/enum/chromeCommand');
    var RepeatButtonState = require('common/enum/repeatButtonState');

    var RepeatButton = Backbone.Model.extend({
        localStorage: new Backbone.LocalStorage('RepeatButton'),
        
        defaults: {
            //  Need to set the ID for Backbone.LocalStorage
            id: 'RepeatButton',
            state: RepeatButtonState.Off
        },
        
        initialize: function () {
            //  Load from Backbone.LocalStorage
            this.fetch();
			
            //  TODO: Legacy support, remove in a few patches after v0.169
            switch (this.get('state')) {
                case null:
                case undefined:
                case 0:
                case "0":
                    this.save('state', RepeatButtonState.Off);
                    break;
                case 1:
                case "1":
                    this.save('state', RepeatButtonState.RepeatSong);
                    break;
                case 2:
                case "2":
                    this.save('state', RepeatButtonState.RepeatAll);
                    break;
            }
            
            chrome.commands.onCommand.addListener(this._onChromeCommandsCommand.bind(this));
        },
        
        toggleRepeatState: function () {
            var nextState = null;

            switch (this.get('state')) {
                case RepeatButtonState.Off:
                    nextState = RepeatButtonState.RepeatAll;
                    break;
                case RepeatButtonState.RepeatAll:
                    nextState = RepeatButtonState.RepeatSong;
                    break;
                case RepeatButtonState.RepeatSong:
                    nextState = RepeatButtonState.Off;
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
                case RepeatButtonState.Off:
                    message = chrome.i18n.getMessage('repeatOff');
                    break;
                case RepeatButtonState.RepeatSong:
                    message = chrome.i18n.getMessage('repeatSong');
                    break;
                case RepeatButtonState.RepeatAll:
                    message = chrome.i18n.getMessage('repeatAll');
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