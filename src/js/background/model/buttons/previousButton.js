define([
    'background/collection/streamItems',
    'background/model/chromeNotifications',
    'background/model/player',
    'background/model/buttons/shuffleButton'
], function (StreamItems, ChromeNotifications, Player, ShuffleButton) {
    'use strict';
    
    var PreviousButton = Backbone.Model.extend({
        defaults: {
            enabled: false
        },

        initialize: function () {
            this.listenTo(StreamItems, 'add remove reset change:active sort', this._toggleEnabled);
            this.listenTo(Player, 'change:currentTime', this._toggleEnabled);
            this.listenTo(ShuffleButton, 'change:enabled', this._toggleEnabled);
            chrome.commands.onCommand.addListener(this._onChromeCommand.bind(this));
            
            this._toggleEnabled();
        },
        
        //  Prevent spamming by only allowing a previous click once every 100ms.
        tryDoTimeBasedPrevious: _.debounce(function () {
            var enabled = this.get('enabled');

            if (enabled) {
                //  Restart when clicking 'previous' if too much time has passed
                if (this._songHasBeenPlaying()) {
                    Player.seekTo(0);
                } else {
                    StreamItems.activatePrevious();
                }
            }

            return enabled;
        }, 100, true),
        
        _onChromeCommand: function (command) {
            if (command === 'previousSong') {
                var didPrevious = this.tryDoTimeBasedPrevious();

                if (!didPrevious) {
                    ChromeNotifications.create({
                        title: chrome.i18n.getMessage('keyboardCommandFailure'),
                        message: chrome.i18n.getMessage('cantGoBackToPreviousSong')
                    });
                }
            }
        },
        
        _toggleEnabled: function () {
            var previousItem = StreamItems.getPrevious();

            var enabled = previousItem !== null || this._songHasBeenPlaying();
            this.set('enabled', enabled);
        },
        
        //  Consider the active song 'playing' after a few (3) seconds. After this amount of time
        //  clicking 'previous' will skip to the front of the song rather than skipping to the previous
        //  song in the stream
        _songHasBeenPlaying: function() {
            return Player.get('currentTime') > 3;
        }
    });
    
    //  Exposed globally so that the foreground can access the same instance through chrome.extension.getBackgroundPage()
    window.PreviousButton = new PreviousButton();
    return window.PreviousButton;
});