'use strict';
import {Model} from 'backbone';
import LocalStorage from 'lib/backbone.localStorage';
import ChromeCommand from 'background/enum/chromeCommand';
import RepeatButtonState from 'common/enum/repeatButtonState';

var RepeatButton = Model.extend({
  localStorage: new LocalStorage('RepeatButton'),

  defaults: {
    // Need to set the ID for Backbone.LocalStorage
    id: 'RepeatButton',
    state: RepeatButtonState.Off
  },

  initialize: function() {
    // Load from Backbone.LocalStorage
    this.fetch();

    chrome.commands.onCommand.addListener(this._onChromeCommandsCommand.bind(this));
  },

  toggleRepeatState: function() {
    var nextState = null;

    switch (this.get('state')) {
      case RepeatButtonState.Off:
        nextState = RepeatButtonState.RepeatAll;
        break;
      case RepeatButtonState.RepeatAll:
        nextState = RepeatButtonState.RepeatVideo;
        break;
      case RepeatButtonState.RepeatVideo:
        nextState = RepeatButtonState.Off;
        break;
      default:
        console.error('Unhandled repeatButtonState:', this.state);
        break;
    }

    this.save({
      state: nextState
    });
  },

  getStateMessage: function() {
    var message = '';
    switch (this.get('state')) {
      case RepeatButtonState.Off:
        message = chrome.i18n.getMessage('repeatOff');
        break;
      case RepeatButtonState.RepeatVideo:
        message = chrome.i18n.getMessage('repeatVideo');
        break;
      case RepeatButtonState.RepeatAll:
        message = chrome.i18n.getMessage('repeatAll');
    }

    return message;
  },

  _onChromeCommandsCommand: function(command) {
    if (command === ChromeCommand.ToggleRepeat) {
      this.toggleRepeatState();

      StreamusBG.channels.backgroundNotification.commands.trigger('show:notification', {
        message: this.getStateMessage()
      });
    }
  }
});

export default RepeatButton;