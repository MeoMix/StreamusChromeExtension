define(function () {
    'use strict';

    var ClearStreamButton = Backbone.Model.extend({
        defaults: {
            enabled: false,
            streamItems: null
        },
        
        initialize: function () {
            var streamItems = this.get('streamItems');

            this.listenTo(streamItems, 'add:completed', this._onStreamItemsAddCompleted);
            this.listenTo(streamItems, 'remove', this._onStreamItemsRemove);
            this.listenTo(streamItems, 'reset', this._onStreamItemsReset);
            this.listenTo(Streamus.channels.foreground.vent, 'beginUnload', this._onForegroundBeginUnload);

            this.set('enabled', !streamItems.isEmpty());
        },
        
        getStateMessage: function () {
            var isEnabled = this.get('enabled');
            var stateMessage = chrome.i18n.getMessage(isEnabled ? 'clearStream' : 'streamEmpty');
            return stateMessage;
        },
        
        _onStreamItemsAddCompleted: function(collection) {
            this.set('enabled', !collection.isEmpty());
        },

        _onStreamItemsRemove: function (model, collection) {
            this.set('enabled', !collection.isEmpty());
        },

        _onStreamItemsReset: function (collection) {
            this.set('enabled', !collection.isEmpty());
        },
        
        //  Since models don't cascade clean-up their listenTo event handlers I need to do this manually when the foreground unloads.
        _onForegroundBeginUnload: function() {
            this.stopListening();
        }
    });

    return ClearStreamButton;
});