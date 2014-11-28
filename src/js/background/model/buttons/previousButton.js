define([
    'background/enum/chromeCommand'
], function (ChromeCommand) {
    'use strict';
    
    var PreviousButton = Backbone.Model.extend({
        defaults: {
            enabled: false,
            player: null,
            shuffleButton: null,
            repeatButton: null,
            stream: null
        },
        
        initialize: function () {
            //  TODO: There's a LOT of things to listen to here. Once Stream can tell me its previousItem I should be able to clean this up easier.
            this.listenTo(this.get('stream').get('items'), 'add remove reset change:active sort', this._toggleEnabled);
            this.listenTo(this.get('player'), 'change:currentTime', this._onPlayerChangeCurrentTime);
            this.listenTo(this.get('shuffleButton'), 'change:enabled', this._onShuffleButtonChangeState);
            this.listenTo(this.get('repeatButton'), 'change:state', this._onRepeatButtonChangeState);
            chrome.commands.onCommand.addListener(this._onChromeCommandsCommand.bind(this));
            
            this._toggleEnabled();
        },
        //  TODO: IDK how I feel about this checking enabled vs outsiders checking enabled.
        //  Prevent spamming by only allowing a previous click once every 100ms.
        tryDoTimeBasedPrevious: _.debounce(function () {
            var enabled = this.get('enabled');

            if (enabled) {
                //  Restart when clicking 'previous' if too much time has passed
                if (this._songHasBeenPlaying()) {
                    this.get('player').seekTo(0);
                } else {
                    this.get('stream').activatePrevious();
                }
            }

            return enabled;
        }, 100, true),
        
        _onPlayerChangeCurrentTime: function () {
            this._toggleEnabled();
        },
        
        _onShuffleButtonChangeState: function () {
            this._toggleEnabled();
        },
        
        _onRepeatButtonChangeState: function () {
            this._toggleEnabled();
        },
        
        _onChromeCommandsCommand: function (command) {
            if (command === ChromeCommand.PreviousSong) {
                var didPrevious = this.tryDoTimeBasedPrevious();

                if (!didPrevious) {
                    Streamus.channels.notification.commands.trigger('show:notification', {
                        title: chrome.i18n.getMessage('keyboardCommandFailure'),
                        message: chrome.i18n.getMessage('cantGoBackToPreviousSong')
                    });
                }
            }
        },
        
        _toggleEnabled: function () {
            var previousItem = this.get('stream').getPrevious();

            var enabled = previousItem !== null || this._songHasBeenPlaying();
            this.set('enabled', enabled);
        },
        
        //  Consider the active song 'playing' after a few (3) seconds. After this amount of time
        //  clicking 'previous' will skip to the front of the song rather than skipping to the previous
        //  song in the stream
        _songHasBeenPlaying: function() {
            return this.get('player').get('currentTime') > 3;
        }
    });
    
    return PreviousButton;
});