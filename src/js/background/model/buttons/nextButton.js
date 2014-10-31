define([
    'background/enum/chromeCommand',
    'common/enum/notificationType',
    'common/enum/repeatButtonState'
], function (ChromeCommand, NotificationType, RepeatButtonState) {
    'use strict';
    
    var NextButton = Backbone.Model.extend({
        defaults: {
            enabled: false,
            stream: null,
            radioButton: null,
            shuffleButton: null,
            repeatButton: null,
        },

        initialize: function () {
            this.listenTo(this.get('stream').get('items'), 'add remove reset change:active', this._toggleEnabled);
            this.listenTo(this.get('radioButton'), 'change:enabled', this._toggleEnabled);
            this.listenTo(this.get('shuffleButton'), 'change:enabled', this._toggleEnabled);
            this.listenTo(this.get('repeatButton'), 'change:state', this._toggleEnabled);
            chrome.commands.onCommand.addListener(this._onChromeCommand.bind(this));

            this._toggleEnabled();
        },
        
        //  Prevent spamming by only allowing a next click once every 100ms.
        tryActivateNextStreamItem: _.debounce(function () {
            var activatedNextItem = false;

            if (this.get('enabled')) {
                var nextItem = this.get('stream').activateNext();
                activatedNextItem = nextItem !== null;
            }

            return activatedNextItem;
        }, 100, true),
        
        _onChromeCommand: function (command) {
            if (command === ChromeCommand.NextSong) {
                var activatedStreamItem = this.tryActivateNextStreamItem();

                if (!activatedStreamItem) {
                    Streamus.channels.notification.commands.trigger('show:notification', {
                        type: NotificationType.Error,
                        title: chrome.i18n.getMessage('keyboardCommandFailure'),
                        message: chrome.i18n.getMessage('cantSkipToNextSong')
                    });
                }
            }
        },
        
        _toggleEnabled: function () {
            var enabled = false;

            var streamItems = this.get('stream').get('items');

            //  TODO: Make this call a getNext() to keep parity with previousButton
            if (streamItems.length > 0) {
                var radioEnabled = this.get('radioButton').get('enabled');
                var shuffleEnabled = this.get('shuffleButton').get('enabled');
                var repeatButtonState = this.get('repeatButton').get('state');

                //  You can skip with shuffle enabled if there are multiple items to shuffle between.
                if (shuffleEnabled && streamItems.length > 1) {
                    enabled = true;
                }
                    //  You can always continue if radio is enabled or if repeating is enabled
                else if (radioEnabled || repeatButtonState !== RepeatButtonState.Disabled) {
                    enabled = true;
                } else {
                    //  Enable only if there are more items to skip to.
                    var activeItemIndex = streamItems.indexOf(streamItems.getActiveItem());

                    if (activeItemIndex + 1 !== streamItems.length) {
                        enabled = true;
                    }
                }
            }

            this.set('enabled', enabled);
        }
    });

    return NextButton;
});