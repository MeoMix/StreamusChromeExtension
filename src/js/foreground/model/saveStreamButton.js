define(function () {
    'use strict';

    var SaveStreamButton = Backbone.Model.extend({
        defaults: {
            enabled: false,
            streamItems: null,
            signInManager: null
        },
        
        initialize: function () {
            var streamItems = this.get('streamItems');
            this.listenTo(streamItems, 'add', this._onStreamItemsAdd);
            this.listenTo(streamItems, 'remove', this._onStreamItemsRemove);
            this.listenTo(streamItems, 'reset', this._onStreamItemsReset);

            var signInManager = this.get('signInManager');
            this.listenTo(signInManager, 'change:signedInUser', this._onSignInManagerChangeSignedInUser);
            
            this._setEnabled(signInManager.isSignedIn(), streamItems.isEmpty());
        },
        
        getStateMessage: function () {
            var signedIn = this.get('signInManager').isSignedIn();

            var stateMessage;
            if (signedIn) {
                stateMessage = this.get('enabled') ? chrome.i18n.getMessage('saveStream') : chrome.i18n.getMessage('streamEmpty');
            } else {
                stateMessage = chrome.i18n.getMessage('notSignedIn');
            }

            return stateMessage;
        },
        
        _setEnabled: function (signedIn, streamEmpty) {
            this.set('enabled', signedIn && !streamEmpty);
        },
        
        _onStreamItemsAdd: function () {
            this._setEnabled(this.get('signInManager').isSignedIn(), false);
        },

        _onStreamItemsRemove: function (model, collection) {
            this._setEnabled(this.get('signInManager').isSignedIn(), collection.isEmpty());
        },

        _onStreamItemsReset: function (collection) {
            this._setEnabled(this.get('signInManager').isSignedIn(), collection.isEmpty());
        },
        
        _onSignInManagerChangeSignedInUser: function() {
            this._setEnabled(this.get('signInManager').isSignedIn(), this.get('streamItems').isEmpty());
        }
    });

    return SaveStreamButton;
});