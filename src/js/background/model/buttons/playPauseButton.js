define([
    'background/collection/streamItems',
    'background/model/chromeNotifications',
    'background/model/player'
], function (StreamItems, ChromeNotifications, Player) {
    'use strict';
    
    var PlayPauseButton = Backbone.Model.extend({
        defaults: {
            enabled: false
        },

        initialize: function () {
            this.listenTo(StreamItems, 'change:active remove reset', this._toggleEnabled);
            chrome.commands.onCommand.addListener(this._onChromeCommand.bind(this));

            this._toggleEnabled();
        },
        
        //  Only allow changing once every 100ms to preent spamming.
        tryTogglePlayerState: _.debounce(function () {
            if (this.get('enabled')) {
                Player.toggleState();
            }

            return this.get('enabled');
        }, 100, true),
        
        _onChromeCommand: function (command) {
            if (command === 'toggleSong') {
                var didTogglePlayerState = PlayPauseButton.tryTogglePlayerState();

                if (!didTogglePlayerState) {
                    ChromeNotifications.create({
                        title: chrome.i18n.getMessage('keyboardCommandFailure'),
                        message: chrome.i18n.getMessage('cantToggleSong')
                    });
                }
            }
        },
        
        _toggleEnabled: function () {
            this.set('enabled', StreamItems.length > 0);
        }
    });
    
    //  Exposed globally so that the foreground can access the same instance through chrome.extension.getBackgroundPage()
    window.PlayPauseButton = new PlayPauseButton();
    return window.PlayPauseButton;
});