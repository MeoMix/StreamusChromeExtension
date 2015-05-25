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

            this.listenTo(Streamus.channels.foreground.vent, 'beginUnload', this._onForegroundBeginUnload);

            this._setEnabled(signInManager.isSignedIn(), streamItems.isEmpty());
        },

        getStateMessage: function() {
            var signedIn = this.get('signInManager').isSignedIn();

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
            this._setEnabled(this.get('signInManager').isSignedIn(), false);
        },

        _onStreamItemsRemove: function(model, collection) {
            this._setEnabled(this.get('signInManager').isSignedIn(), collection.isEmpty());
        },

        _onStreamItemsReset: function(collection) {
            this._setEnabled(this.get('signInManager').isSignedIn(), collection.isEmpty());
        },

        _onSignInManagerChangeSignedInUser: function() {
            this._setEnabled(this.get('signInManager').isSignedIn(), this.get('streamItems').isEmpty());
        },

        // Since models don't cascade clean-up their listenTo event handlers I need to do this manually when the foreground unloads.
        _onForegroundBeginUnload: function() {
            this.stopListening();
        }
    });

    return SaveStreamButton;
});