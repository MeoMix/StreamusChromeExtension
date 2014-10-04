define([
    'background/model/chromeNotifications',
    'common/enum/repeatButtonState'
], function (ChromeNotifications, RepeatButtonState) {
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
            
            chrome.commands.onCommand.addListener(this._onChromeCommand.bind(this));
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
        },

        _onChromeCommand: function (command) {
            if (command === 'toggleRepeat') {
                this.toggleRepeatState();

                //  TODO: i18n
                var message = '';
                switch(this.get('state')) {
                    case RepeatButtonState.Disabled:
                        message = 'Repeat off';
                        break;
                    case RepeatButtonState.RepeatSong:
                        message = 'Repeat song on';
                        break;
                    case RepeatButtonState.RepeatStream:
                        message = 'Repeat stream on';
                }
                
                ChromeNotifications.create({
                    message: message
                });
            }
        }
    });

    //  Exposed globally so that the foreground can access the same instance through chrome.extension.getBackgroundPage()
    window.RepeatButton = new RepeatButton();
    return window.RepeatButton;
});