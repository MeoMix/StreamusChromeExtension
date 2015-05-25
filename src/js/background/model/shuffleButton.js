define(function(require) {
  'use strict';

  var ChromeCommand = require('background/enum/chromeCommand');

  var ShuffleButton = Backbone.Model.extend({
    localStorage: new Backbone.LocalStorage('ShuffleButton'),

    defaults: {
      // Need to set the ID for Backbone.LocalStorage
      id: 'ShuffleButton',
      enabled: false
    },

    initialize: function() {
      // Load from Backbone.LocalStorage
      this.fetch();

      chrome.commands.onCommand.addListener(this._onChromeCommandsCommand.bind(this));
    },

    toggleEnabled: function() {
      this.save({
        enabled: !this.get('enabled')
      });
    },

    getStateMessage: function() {
      var isEnabled = this.get('enabled');
      var stateMessage = chrome.i18n.getMessage(isEnabled ? 'shufflingOn' : 'shufflingOff');
      return stateMessage;
    },

    _onChromeCommandsCommand: function(command) {
      if (command === ChromeCommand.ToggleShuffle) {
        this.toggleEnabled();

        Streamus.channels.backgroundNotification.commands.trigger('show:notification', {
          message: this.getStateMessage()
        });
      }
    }
  });

  return ShuffleButton;
});