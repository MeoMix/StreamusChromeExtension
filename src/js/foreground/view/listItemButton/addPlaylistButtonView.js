define(function(require) {
    'use strict';

    var ListItemButtonView = require('foreground/view/listItemButton/listItemButtonView');
    var AddListItemButtonTemplate = require('text!template/listItemButton/addListItemButton.html');
    var AddIconTemplate = require('text!template/icon/addIcon_18.svg');

    var AddPlaylistButtonView = ListItemButtonView.extend({
        template: _.template(AddListItemButtonTemplate),
        templateHelpers: {
            addIcon: _.template(AddIconTemplate)()
        },

        streamItems: null,

        streamItemsEvents: {
            'add': '_onStreamItemsAdd',
            'remove': '_onStreamItemsRemove',
            'reset': '_onStreamItemsReset'
        },

        playlistItemsEvents: {
            'add': '_onPlaylistItemsAdd',
            'remove': '_onPlaylistItemsRemove',
            'reset': '_onPlaylistItemsReset'
        },

        initialize: function() {
            this.streamItems = Streamus.backgroundPage.stream.get('items');
            this.bindEntityEvents(this.streamItems, this.streamItemsEvents);
            this.bindEntityEvents(this.model.get('items'), this.playlistItemsEvents);

            ListItemButtonView.prototype.initialize.apply(this, arguments);
        },

        onRender: function() {
            this._setState();
        },

        _onPlaylistItemsAdd: function() {
            this._setState();
        },

        _onPlaylistItemsRemove: function() {
            this._setState();
        },

        _onPlaylistItemsReset: function() {
            this._setState();
        },

        _onStreamItemsAdd: function() {
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

            var title = chrome.i18n.getMessage('add');

            if (empty) {
                title = chrome.i18n.getMessage('playlistEmpty');
            } else if (duplicatesInfo.message !== '') {
                title = duplicatesInfo.message;
            }

            this.$el.attr('title', title);
        },

        doOnClickAction: function() {
            var songs = this.model.get('items').pluck('song');
            this.streamItems.addSongs(songs);
        }
    });

    return AddPlaylistButtonView;
});