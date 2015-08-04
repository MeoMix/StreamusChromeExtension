define(function() {
  'use strict';

  var SaveStreamButton = Backbone.Model.extend({
    defaults: {
      enabled: false,
      streamItems: null,
      signInManager: null
    },

    initialize: function() {
      var streamItems = this.get('streamItems');
      this.listenTo(streamItems, 'add:completed', this._onStreamItemsAddCompleted);
      this.listenTo(streamItems, 'remove', this._onStreamItemsRemove);
      this.listenTo(streamItems, 'reset', this._onStreamItemsReset);

      var signInManager = this.get('signInManager');
      this.listenTo(signInManager, 'change:signedInUser', this._onSignInManagerChangeSignedInUser);
      this._setEnabled(signInManager.has('signedInUser'), streamItems.isEmpty());
    },

    getStateMessage: function() {
      var signedIn = this.get('signInManager').has('signedInUser');

      var stateMessage;
      if (signedIn) {
        var isEnabled = this.get('enabled');
        stateMessage = chrome.i18n.getMessage(isEnabled ? 'saveStream' : 'streamEmpty');
      } else {
        stateMessage = chrome.i18n.getMessage('notSignedIn');
      }

      return stateMessage;
    },

    _setEnabled: function(signedIn, streamEmpty) {
      this.set('enabled', signedIn && !streamEmpty);
    },

    _onStreamItemsAddCompleted: function() {
      this._setEnabled(this.get('signInManager').has('signedInUser'), false);
    },

    _onStreamItemsRemove: function(model, collection) {
      this._setEnabled(this.get('signInManager').has('signedInUser'), collection.isEmpty());
    },

    _onStreamItemsReset: function(collection) {
      this._setEnabled(this.get('signInManager').has('signedInUser'), collection.isEmpty());
    },

    _onSignInManagerChangeSignedInUser: function() {
      this._setEnabled(this.get('signInManager').has('signedInUser'), this.get('streamItems').isEmpty());
    }
  });

  return SaveStreamButton;
});