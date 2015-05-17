define(function(require) {
    'use strict';

    var ListItemButton = require('foreground/view/behavior/listItemButton');
    var PlayListItemButtonTemplate = require('text!template/listItemButton/playListItemButton.html');
    var PlayIconTemplate = require('text!template/icon/playIcon_18.svg');

    var PlayPlaylistButtonView = Marionette.ItemView.extend({
        template: _.template(PlayListItemButtonTemplate),
        templateHelpers: {
            playIcon: _.template(PlayIconTemplate)()
        },

        behaviors: {
            ListItemButton: {
                behaviorClass: ListItemButton
            }
        },

        streamItems: null,

        playlistItemsEvents: {
            'add:completed': '_onPlaylistItemsAddCompleted',
            'remove': '_onPlaylistItemsRemove',
            'reset': '_onPlaylistItemsReset'
        },

        initialize: function(options) {
            this.streamItems = options.streamItems;
            this.bindEntityEvents(this.model.get('items'), this.playlistItemsEvents);
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

        _onPlaylistItemsAddCompleted: function(collection) {
            this._setState(collection.isEmpty());
        },

        _onPlaylistItemsRemove: function(model, collection) {
            this._setState(collection.isEmpty());
        },

        _onPlaylistItemsReset: function(collection) {
            this._setState(collection.isEmpty());
        },

        _setState: function(isEmpty) {
            this.$el.toggleClass('is-disabled', isEmpty);

            var tooltipText = isEmpty ? chrome.i18n.getMessage('playlistEmpty') : chrome.i18n.getMessage('play');
            this.$el.attr('data-tooltip-text', tooltipText);
        }
    });

    return PlayPlaylistButtonView;
});