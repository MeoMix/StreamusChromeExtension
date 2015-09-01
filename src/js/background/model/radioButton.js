'use strict';
import {Model} from 'backbone';
import LocalStorage from 'lib/backbone.localStorage';
import ChromeCommand from 'background/enum/chromeCommand';

var RadioButton = Model.extend({
  localStorage: new LocalStorage('RadioButton'),

  defaults: {
    // Need to set the ID for Backbone.LocalStorage
    id: 'RadioButton',
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
    var stateMessage = chrome.i18n.getMessage(isEnabled ? 'radioOn' : 'radioOff');
    return stateMessage;
  },

  _onChromeCommandsCommand: function(command) {
    if (command === ChromeCommand.ToggleRadio) {
      this.toggleEnabled();

      StreamusBG.channels.backgroundNotification.commands.trigger('show:notification', {
        message: this.getStateMessage()
      });
    }
  }
});

export default RadioButton;