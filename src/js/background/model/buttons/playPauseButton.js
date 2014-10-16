define(function () {
    'use strict';
    
    var PlayPauseButton = Backbone.Model.extend({
        defaults: {
            enabled: false,
            player: null,
            streamItems: null,
        },

        initialize: function () {
            this.listenTo(this.get('streamItems'), 'change:active remove reset', this._toggleEnabled);
            chrome.commands.onCommand.addListener(this._onChromeCommand.bind(this));

            this._toggleEnabled();
        },
        
        //  Only allow changing once every 100ms to preent spamming.
        tryTogglePlayerState: _.debounce(function () {
            if (this.get('enabled')) {
                this.get('player').toggleState();
            }

            return this.get('enabled');
        }, 100, true),
        
        _onChromeCommand: function (command) {
            if (command === 'toggleSong') {
                var didTogglePlayerState = this.tryTogglePlayerState();

                if (!didTogglePlayerState) {
                    //  TODO: This probably shouldn't be a background notification -- they can use a keyboard shortcut with UI open.
                    Streamus.channels.backgroundNotification.commands.trigger('show:notification', {
                        title: chrome.i18n.getMessage('keyboardCommandFailure'),
                        message: chrome.i18n.getMessage('cantToggleSong')
                    });
                }
            }
        },
        
        _toggleEnabled: function () {
            this.set('enabled', this.get('streamItems').length > 0);
        }
    });
    
    return PlayPauseButton;
});