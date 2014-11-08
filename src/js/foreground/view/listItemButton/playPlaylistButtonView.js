define([
    'foreground/view/listItemButton/listItemButtonView',
    'text!template/listItemButton/playListItemButton.html'
], function (ListItemButtonView, PlayListItemButtonTemplate) {
    'use strict';

    var PlayPlaylistButtonView = ListItemButtonView.extend({
        template: _.template(PlayListItemButtonTemplate),
        
        streamItems: null,

        initialize: function () {
            this.streamItems = Streamus.backgroundPage.stream.get('items');

            var playlistItems = this.model.get('items');
            this.listenTo(playlistItems, 'add', this._onPlaylistItemsAdd);
            this.listenTo(playlistItems, 'remove', this._onPlaylistItemsRemove);
            this.listenTo(playlistItems, 'reset', this._onPlaylistItemsReset);
            
            ListItemButtonView.prototype.initialize.apply(this, arguments);
        },
        
        onRender: function() {
            this._setState(this.model.get('items').isEmpty());
        },
        
        doOnClickAction: function () {
            var songs = this.model.get('items').pluck('song');

            this.streamItems.addSongs(songs, {
                playOnAdd: true
            });
        },
        
        _onPlaylistItemsAdd: function () {
            this._setState(false);
        },

        _onPlaylistItemsRemove: function (model, collection) {
            this._setState(collection.isEmpty());
        },

        _onPlaylistItemsReset: function (collection) {
            this._setState(collection.isEmpty());
        },
        
        _setState: function (isEmpty) {
            this.$el.toggleClass('disabled', isEmpty);

            var title = isEmpty ? chrome.i18n.getMessage('playlistEmpty') : chrome.i18n.getMessage('play');
            this.$el.attr('title', title);
        }
    });

    return PlayPlaylistButtonView;
});