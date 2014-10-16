define(function () {
    'use strict';
    
    var PreviousButton = Backbone.Model.extend({
        defaults: {
            enabled: false,
            player: null,
            shuffleButton: null,
            streamItems: null
        },
        
        initialize: function () {
            this.listenTo(this.get('streamItems'), 'add remove reset change:active sort', this._toggleEnabled);
            this.listenTo(this.get('player'), 'change:currentTime', this._toggleEnabled);
            this.listenTo(this.get('shuffleButton'), 'change:enabled', this._toggleEnabled);
            chrome.commands.onCommand.addListener(this._onChromeCommand.bind(this));
            
            this._toggleEnabled();
        },
        
        //  Prevent spamming by only allowing a previous click once every 100ms.
        tryDoTimeBasedPrevious: _.debounce(function () {
            var enabled = this.get('enabled');

            if (enabled) {
                //  Restart when clicking 'previous' if too much time has passed
                if (this._songHasBeenPlaying()) {
                    this.get('player').seekTo(0);
                } else {
                    this.get('streamItems').activatePrevious();
                }
            }

            return enabled;
        }, 100, true),
        
        _onChromeCommand: function (command) {
            if (command === 'previousSong') {
                var didPrevious = this.tryDoTimeBasedPrevious();

                if (!didPrevious) {
                    Streamus.channels.backgroundNotification.commands.trigger('show:notification', {
                        title: chrome.i18n.getMessage('keyboardCommandFailure'),
                        message: chrome.i18n.getMessage('cantGoBackToPreviousSong')
                    });
                }
            }
        },
        
        _toggleEnabled: function () {
            var previousItem = this.get('streamItems').getPrevious();

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