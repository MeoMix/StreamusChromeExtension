define(function(require) {
    'use strict';

    var ListItemButtonView = require('foreground/view/listItemButton/listItemButtonView');
    var PlayListItemButtonTemplate = require('text!template/listItemButton/playListItemButton.html');
    var PlayIconTemplate = require('text!template/icon/playIcon_18.svg');

    var PlayPlaylistButtonView = ListItemButtonView.extend({
        template: _.template(PlayListItemButtonTemplate),
        templateHelpers: {
            playIcon: _.template(PlayIconTemplate)()
        },

        streamItems: null,

        playlistItemsEvents: {
            'add': '_onPlaylistItemsAdd',
            'remove': '_onPlaylistItemsRemove',
            'reset': '_onPlaylistItemsReset'
        },

        initialize: function() {
            this.streamItems = Streamus.backgroundPage.stream.get('items');
            this.bindEntityEvents(this.model.get('items'), this.playlistItemsEvents);

            ListItemButtonView.prototype.initialize.apply(this, arguments);
        },

        onRender: function() {
            this._setState(this.model.get('items').isEmpty());
        },

        doOnClickAction: function() {
            var songs = this.model.get('items').pluck('song');

            this.streamItems.addSongs(songs, {
                playOnAdd: true
            });
        },

        _onPlaylistItemsAdd: function() {
            this._setState(false);
        },

        _onPlaylistItemsRemove: function(model, collection) {
            this._setState(collection.isEmpty());
        },

        _onPlaylistItemsReset: function(collection) {
            this._setState(collection.isEmpty());
        },

        _setState: function(isEmpty) {
            this.$el.toggleClass('is-disabled', isEmpty);

            var title = isEmpty ? chrome.i18n.getMessage('playlistEmpty') : chrome.i18n.getMessage('play');
            this.$el.attr('title', title);
        }
    });

    return PlayPlaylistButtonView;
});