define(function(require) {
    'use strict';

    var ListItemButton = require('foreground/view/behavior/listItemButton');
    var AddListItemButtonTemplate = require('text!template/listItemButton/addListItemButton.html');
    var AddIconTemplate = require('text!template/icon/addIcon_18.svg');

    var AddPlaylistButtonView = Marionette.ItemView.extend({
        template: _.template(AddListItemButtonTemplate),
        templateHelpers: {
            addIcon: _.template(AddIconTemplate)()
        },

        behaviors: {
            ListItemButton: {
                behaviorClass: ListItemButton
            }
        },

        streamItems: null,

        streamItemsEvents: {
            'add:completed': '_onStreamItemsAddCompleted',
            'remove': '_onStreamItemsRemove',
            'reset': '_onStreamItemsReset'
        },

        playlistItemsEvents: {
            'add:completed': '_onPlaylistItemsAddCompleted',
            'remove': '_onPlaylistItemsRemove',
            'reset': '_onPlaylistItemsReset'
        },

        initialize: function(options) {
            this.streamItems = options.streamItems;
            this.bindEntityEvents(this.streamItems, this.streamItemsEvents);
            this.bindEntityEvents(this.model.get('items'), this.playlistItemsEvents);
        },

        onRender: function() {
            this._setState();
        },

        onClick: function() {
            var songs = this.model.get('items').pluck('song');
            this.streamItems.addSongs(songs);
        },

        _onPlaylistItemsAddCompleted: function() {
            this._setState();
        },

        _onPlaylistItemsRemove: function() {
            this._setState();
        },

        _onPlaylistItemsReset: function() {
            this._setState();
        },

        _onStreamItemsAddCompleted: function() {
            this._setState();
        },

        _onStreamItemsRemove: function() {
            this._setState();
        },

        _onStreamItemsReset: function() {
            this._setState();
        },

        _setState: function() {
            var playlistItems = this.model.get('items');
            var empty = playlistItems.length === 0;
            var duplicatesInfo = this.streamItems.getDuplicatesInfo(playlistItems.pluck('song'));

            this.$el.toggleClass('is-disabled', empty || duplicatesInfo.allDuplicates);

            var tooltipText = chrome.i18n.getMessage('add');

            if (empty) {
                tooltipText = chrome.i18n.getMessage('playlistEmpty');
            } else if (duplicatesInfo.message !== '') {
                tooltipText = duplicatesInfo.message;
            }

            this.$el.attr('data-tooltip-text', tooltipText);
        }
    });

    return AddPlaylistButtonView;
});