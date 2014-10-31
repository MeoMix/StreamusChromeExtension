define([
    'background/enum/chromeCommand',
    'common/enum/notificationType'
], function (ChromeCommand, NotificationType) {
    'use strict';
    
    var PlayPauseButton = Backbone.Model.extend({
        defaults: {
            enabled: false,
            player: null,
            streamItems: null,
        },

        initialize: function () {
            this.listenTo(this.get('streamItems'), 'add remove reset', this._toggleEnabled);
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
            if (command === ChromeCommand.ToggleSong) {
                var didTogglePlayerState = this.tryTogglePlayerState();

                if (!didTogglePlayerState) {
                    Streamus.channels.notification.commands.trigger('show:notification', {
                        type: NotificationType.Success,
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