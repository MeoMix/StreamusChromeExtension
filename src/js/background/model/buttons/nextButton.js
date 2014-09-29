define([
    'background/collection/streamItems',
    'background/model/chromeNotifications',
    'background/model/buttons/radioButton',
    'background/model/buttons/shuffleButton',
    'background/model/buttons/repeatButton',
    'common/enum/repeatButtonState'
], function (StreamItems, ChromeNotifications, RadioButton, ShuffleButton, RepeatButton, RepeatButtonState) {
    'use strict';
    
    var NextButton = Backbone.Model.extend({
        defaults: {
            enabled: false
        },
        
        initialize: function () {
            this.listenTo(StreamItems, 'add remove reset change:active', this._toggleEnabled);
            this.listenTo(RadioButton, 'change:enabled', this._toggleEnabled);
            this.listenTo(ShuffleButton, 'change:enabled', this._toggleEnabled);
            this.listenTo(RepeatButton, 'change:state', this._toggleEnabled);
            chrome.commands.onCommand.addListener(this._onChromeCommand.bind(this));

            this._toggleEnabled();
        },
        
        //  Prevent spamming by only allowing a next click once every 100ms.
        tryActivateNextStreamItem: _.debounce(function () {
            var activatedNextItem = false;

            if (this.get('enabled')) {
                var nextItem = StreamItems.activateNext();
                activatedNextItem = nextItem !== null;
            }

            return activatedNextItem;
        }, 100, true),
        
        _onChromeCommand: function (command) {
            if (command === 'nextSong') {
                var activatedStreamItem = this.tryActivateNextStreamItem();

                if (!activatedStreamItem) {
                    ChromeNotifications.create({
                        title: chrome.i18n.getMessage('keyboardCommandFailure'),
                        message: chrome.i18n.getMessage('cantSkipToNextSong')
                    });
                }
            }
        },
        
        _toggleEnabled: function () {
            var enabled = false;

            //  TODO: Make this call a getNext() to keep parity with previousButton
            if (StreamItems.length > 0) {
                var radioEnabled = RadioButton.get('enabled');
                var shuffleEnabled = ShuffleButton.get('enabled');
                var repeatButtonState = RepeatButton.get('state');

                //  You can skip with shuffle enabled if there are multiple items to shuffle between.
                if (shuffleEnabled && StreamItems.length > 1) {
                    enabled = true;
                }
                    //  You can always continue if radio is enabled or if repeating is enabled
                else if (radioEnabled || repeatButtonState !== RepeatButtonState.Disabled) {
                    enabled = true;
                } else {
                    //  Enable only if there are more items to skip to.
                    var activeItemIndex = StreamItems.indexOf(StreamItems.getActiveItem());

                    if (activeItemIndex + 1 !== StreamItems.length) {
                        enabled = true;
                    }
                }
            }

            this.set('enabled', enabled);
        }
    });

    //  Exposed globally so that the foreground can access the same instance through chrome.extension.getBackgroundPage()
    window.NextButton = new NextButton();
    return window.NextButton;
});