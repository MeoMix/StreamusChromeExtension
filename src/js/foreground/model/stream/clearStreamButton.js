define(function() {
  'use strict';

  var ClearStreamButton = Backbone.Model.extend({
    defaults: {
      enabled: false,
      streamItems: null
    },

    initialize: function() {
      var streamItems = this.get('streamItems');

      this.listenTo(streamItems, 'add:completed', this._onStreamItemsAddCompleted);
      this.listenTo(streamItems, 'remove', this._onStreamItemsRemove);
      this.listenTo(streamItems, 'reset', this._onStreamItemsReset);

      this.set('enabled', !streamItems.isEmpty());
    },

    getStateMessage: function() {
      var isEnabled = this.get('enabled');
      var stateMessage = chrome.i18n.getMessage(isEnabled ? 'clearStream' : 'streamEmpty');
      return stateMessage;
    },

    _onStreamItemsAddCompleted: function(collection) {
      this.set('enabled', !collection.isEmpty());
    },

    _onStreamItemsRemove: function(model, collection) {
      this.set('enabled', !collection.isEmpty());
    },

    _onStreamItemsReset: function(collection) {
      this.set('enabled', !collection.isEmpty());
    }
  });

  return ClearStreamButton;
});