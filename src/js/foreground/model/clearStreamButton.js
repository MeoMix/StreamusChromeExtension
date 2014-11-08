define(function () {
    'use strict';

    var ClearStreamButton = Backbone.Model.extend({
        defaults: {
            enabled: false,
            streamItems: null
        },
        
        initialize: function () {
            var streamItems = this.get('streamItems');

            this.listenTo(streamItems, 'add', this._onStreamItemsAdd);
            this.listenTo(streamItems, 'remove', this._onStreamItemsRemove);
            this.listenTo(streamItems, 'reset', this._onStreamItemsReset);

            this.set('enabled', !streamItems.isEmpty());
        },
        
        getStateMessage: function () {
            var stateMessage = this.get('enabled') ? chrome.i18n.getMessage('clearStream') : chrome.i18n.getMessage('streamEmpty');
            return stateMessage;
        },
        
        _onStreamItemsAdd: function () {
            this.set('enabled', true);
        },

        _onStreamItemsRemove: function (model, collection) {
            this.set('enabled', !collection.isEmpty());
        },

        _onStreamItemsReset: function (collection) {
            this.set('enabled', !collection.isEmpty());
        }
    });

    return ClearStreamButton;
});