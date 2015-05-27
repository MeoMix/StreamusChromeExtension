define(function(require) {
  'use strict';

  var ChromeCommand = require('background/enum/chromeCommand');
  var RepeatButtonState = require('common/enum/repeatButtonState');

  var NextButton = Backbone.Model.extend({
    defaults: {
      enabled: false,
      stream: null,
      radioButton: null,
      shuffleButton: null,
      repeatButton: null,
    },

    initialize: function() {
      this.listenTo(this.get('stream').get('items'), 'add remove reset change:active sort', this._setEnabled);
      this.listenTo(this.get('radioButton'), 'change:enabled', this._onRadioButtonChangeEnabled);
      this.listenTo(this.get('shuffleButton'), 'change:enabled', this._onShuffleButtonChangeEnabled);
      this.listenTo(this.get('repeatButton'), 'change:state', this._onRepeatButtonChangeState);
      chrome.commands.onCommand.addListener(this._onChromeCommandsCommand.bind(this));

      this._setEnabled();
    },

    // Prevent spamming by only allowing a next click once every 100ms.
    tryActivateNextStreamItem: _.debounce(function() {
      var activatedNextItem = false;

      if (this.get('enabled')) {
        var nextItem = this.get('stream').activateNext();
        activatedNextItem = !_.isNull(nextItem);
      }

      return activatedNextItem;
    }, 100, true),

    _onChromeCommandsCommand: function(command) {
      if (command === ChromeCommand.NextSong) {
        var activatedStreamItem = this.tryActivateNextStreamItem();

        if (!activatedStreamItem) {
          StreamusBG.channels.notification.commands.trigger('show:notification', {
            title: chrome.i18n.getMessage('keyboardCommandFailure'),
            message: chrome.i18n.getMessage('cantSkipToNextSong')
          });
        }
      }
    },

    _onRepeatButtonChangeState: function() {
      this._setEnabled();
    },

    _onShuffleButtonChangeEnabled: function() {
      this._setEnabled();
    },

    _onRadioButtonChangeEnabled: function() {
      this._setEnabled();
    },

    _setEnabled: function() {
      var enabled = false;

      var streamItems = this.get('stream').get('items');

      if (streamItems.length > 0) {
        var radioEnabled = this.get('radioButton').get('enabled');
        var shuffleEnabled = this.get('shuffleButton').get('enabled');
        var repeatButtonState = this.get('repeatButton').get('state');

        if (shuffleEnabled && streamItems.length > 1) {
          // You can skip with shuffle enabled if there are multiple items to shuffle between.
          enabled = true;
        } else if (radioEnabled || repeatButtonState !== RepeatButtonState.Off) {
          // You can always continue if radio is enabled or if repeating is enabled
          enabled = true;
        } else {
          // Enable only if there are more items to skip to.
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