define([
    'foreground/collection/contextMenuItems',
    'foreground/model/contextMenuActions',
    'foreground/view/addSongButtonView',
    'foreground/view/deleteButtonView',
    'foreground/view/multiSelectListItemView',
    'foreground/view/playSongButtonView',
    'text!template/listItem.html'
], function (ContextMenuItems, ContextMenuActions, AddSongButtonView, DeleteButtonView, MultiSelectListItemView, PlaySongButtonView, ListItemTemplate) {
    'use strict';

    var PlaylistItemView = MultiSelectListItemView.extend({
        className: MultiSelectListItemView.prototype.className + ' playlist-item',

        template: _.template(ListItemTemplate),

        attributes: function () {
            return {
                'data-id': this.model.get('id'),
                'data-type': this.options.type
            };
        },

        events: _.extend({}, MultiSelectListItemView.prototype.events, {
            'dblclick': '_playInStream'
        }),
        
        modelEvents: _.extend({}, MultiSelectListItemView.prototype.modelEvents, {
            'change:id': '_setDataId _setShowingSpinnerClass'
        }),
        
        buttonViews: [PlaySongButtonView, AddSongButtonView, DeleteButtonView],
        
        onRender: function () {
            this._setShowingSpinnerClass();

            MultiSelectListItemView.prototype.onRender.apply(this, arguments);
        },
        
        //  If the playlistItem hasn't been successfully saved to the server -- show a spinner over the UI.
        _setShowingSpinnerClass: function () {
            this.$el.toggleClass('is-showingSpinner', this.model.isNew());
        },
        
        _setDataId: function () {
            this.$el.data('id', this.model.get('id'));
        },
        
        _showContextMenu: function (event) {
            event.preventDefault();

            ContextMenuItems.reset([{
                    text: chrome.i18n.getMessage('copyUrl'),
                    onClick: this._copyUrl.bind(this)
                }, {
                    text: chrome.i18n.getMessage('copyTitleAndUrl'),
                    onClick: this._copyTitleAndUrl.bind(this)
                }, {
                    text: chrome.i18n.getMessage('deleteSong'),
                    onClick: this._destroyModel.bind(this)
                }, {
                    text: chrome.i18n.getMessage('add'),
                    onClick: this._addToStream.bind(this)
                }, {
                    text: chrome.i18n.getMessage('play'),
                    onClick: this._playInStream.bind(this)
                }, {
                    text: chrome.i18n.getMessage('watchOnYouTube'),
                    onClick: this._watchOnYouTube.bind(this)
                }]
            );
        },
        
        _addToStream: function () {
            ContextMenuActions.addSongsToStream(this.model.get('song'));
        },
        
        _copyUrl: function () {
            var songUrl = this.model.get('song').get('url');
            ContextMenuActions.copyUrl(songUrl);
        },
        
        _copyTitleAndUrl: function () {
            var songTitle = this.model.get('title');
            var songUrl = this.model.get('song').get('url');
            ContextMenuActions.copyTitleAndUrl(songTitle, songUrl);
        },
        
        _destroyModel: function () {
            this.model.destroy();
        },
        
        _playInStream: function () {
            ContextMenuActions.playSongsInStream(this.model.get('song'));
        },
        
        _watchOnYouTube: function () {
            var song = this.model.get('song');
            ContextMenuActions.watchOnYouTube(song.get('id'), song.get('url'));
        }
    });

    return PlaylistItemView;
});