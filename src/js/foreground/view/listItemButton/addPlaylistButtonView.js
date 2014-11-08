define([
    'foreground/view/listItemButton/listItemButtonView',
    'text!template/listItemButton/addListItemButton.html'
], function (ListItemButtonView, AddListItemButtonTemplate) {
    'use strict';

    var AddPlaylistButtonView = ListItemButtonView.extend({
        template: _.template(AddListItemButtonTemplate),
        
        streamItems: null,

        initialize: function () {
            this.streamItems = Streamus.backgroundPage.stream.get('items');
            this.listenTo(this.streamItems, 'add', this._onStreamItemsAdd);
            this.listenTo(this.streamItems, 'remove', this._onStreamItemsRemove);
            this.listenTo(this.streamItems, 'reset', this._onStreamItemsReset);
            
            var playlistItems = this.model.get('items');
            this.listenTo(playlistItems, 'add', this._onPlaylistItemsAdd);
            this.listenTo(playlistItems, 'remove', this._onPlaylistItemsRemove);
            this.listenTo(playlistItems, 'reset', this._onPlaylistItemsReset);

            ListItemButtonView.prototype.initialize.apply(this, arguments);
        },

        onRender: function () {
            this._setState();
        },
        
        _onPlaylistItemsAdd: function () {
            this._setState();
        },

        _onPlaylistItemsRemove: function () {
            this._setState();
        },

        _onPlaylistItemsReset: function () {
            this._setState();
        },
        
        _onStreamItemsAdd: function () {
            this._setState();
        },

        _onStreamItemsRemove: function () {
            this._setState();
        },

        _onStreamItemsReset: function () {
            this._setState();
        },
        
        _setState: function () {
            var playlistItems = this.model.get('items');
            var empty = playlistItems.length === 0;
            var duplicatesInfo = this.streamItems.getDuplicatesInfo(playlistItems.pluck('song'));

            this.$el.toggleClass('disabled', empty || duplicatesInfo.allDuplicates);

            var title = chrome.i18n.getMessage('add');
            
            if (empty) {
                title = chrome.i18n.getMessage('playlistEmpty');
            }
            else if (duplicatesInfo.message !== '') {
                title = duplicatesInfo.message;
            }

            this.$el.attr('title', title);
        },
        
        doOnClickAction: function () {
            var songs = this.model.get('items').pluck('song');
            this.streamItems.addSongs(songs);
        }
    });

    return AddPlaylistButtonView;
});