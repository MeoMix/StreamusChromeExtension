define([
    'common/enum/repeatButtonState'
], function (RepeatButtonState) {
    'use strict';
    
    var NextButton = Backbone.Model.extend({
        defaults: {
            enabled: false,
            streamItems: null,
            radioButton: null,
            shuffleButton: null,
            repeatButton: null,
        },

        initialize: function () {
            this.listenTo(this.get('streamItems'), 'add remove reset change:active', this._toggleEnabled);
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
                var nextItem = this.get('streamItems').activateNext();
                activatedNextItem = nextItem !== null;
            }

            return activatedNextItem;
        }, 100, true),
        
        _onChromeCommand: function (command) {
            if (command === 'nextSong') {
                var activatedStreamItem = this.tryActivateNextStreamItem();

                if (!activatedStreamItem) {
                    Streamus.channels.backgroundNotification.commands.trigger('show:notification', {
                        title: chrome.i18n.getMessage('keyboardCommandFailure'),
                        message: chrome.i18n.getMessage('cantSkipToNextSong')
                    });
                }
            }
        },
        
        _toggleEnabled: function () {
            var enabled = false;

            //  TODO: Make this call a getNext() to keep parity with previousButton
            if (this.get('streamItems').length > 0) {
                var radioEnabled = this.get('radioButton').get('enabled');
                var shuffleEnabled = this.get('shuffleButton').get('enabled');
                var repeatButtonState = this.get('repeatButton').get('state');

                //  You can skip with shuffle enabled if there are multiple items to shuffle between.
                if (shuffleEnabled && this.get('streamItems').length > 1) {
                    enabled = true;
                }
                    //  You can always continue if radio is enabled or if repeating is enabled
                else if (radioEnabled || repeatButtonState !== RepeatButtonState.Disabled) {
                    enabled = true;
                } else {
                    //  Enable only if there are more items to skip to.
                    var activeItemIndex = this.get('streamItems').indexOf(this.get('streamItems').getActiveItem());

                    if (activeItemIndex + 1 !== this.get('streamItems').length) {
                        enabled = true;
                    }
                }
            }

            this.set('enabled', enabled);
        }
    });

    return NextButton;
});