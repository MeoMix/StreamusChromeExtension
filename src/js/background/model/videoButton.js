define(function() {
  'use strict';

  var VideoButton = Backbone.Model.extend({
    localStorage: new Backbone.LocalStorage('VideoButton'),

    defaults: {
      // Need to set the ID for Backbone.LocalStorage
      id: 'VideoButton',
      enabled: false
    },

    initialize: function() {
      // Load from Backbone.LocalStorage
      this.fetch();
    },

    toggleEnabled: function() {
      this.save({
        enabled: !this.get('enabled')
      });
    },

    getStateMessage: function() {
      var isEnabled = this.get('enabled');
      var stateMessage = chrome.i18n.getMessage(isEnabled ? 'videoOn' : 'videoOff');
      return stateMessage;
    }
  });

  return VideoButton;
});