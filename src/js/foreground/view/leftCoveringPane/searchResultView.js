define([
    'foreground/collection/contextMenuItems',
    'foreground/model/contextMenuActions',
    'foreground/view/addToStreamButtonView',
    'foreground/view/multiSelectListItemView',
    'foreground/view/playInStreamButtonView',
    'foreground/view/saveToPlaylistButtonView',
    'text!template/listItem.html'
], function (ContextMenuItems, ContextMenuActions, AddToStreamButtonView, MultiSelectListItemView, PlayInStreamButtonView, SaveToPlaylistButtonView, ListItemTemplate) {
    'use strict';

    var SearchResultView = MultiSelectListItemView.extend({
        className: MultiSelectListItemView.prototype.className + ' search-result',
        template: _.template(ListItemTemplate),

        attributes: function () {
            return {
                'data-id': this.model.get('id'),
                'data-type': this.options.type
            };
        },

        buttonViews: [PlayInStreamButtonView, AddToStreamButtonView, SaveToPlaylistButtonView],
        
        events: _.extend({}, MultiSelectListItemView.prototype.events, {
            'dblclick': '_playInStream'
        }),
        
        _showContextMenu: function (event) {
            event.preventDefault();

            ContextMenuItems.reset([{
                    text: chrome.i18n.getMessage('play'),
                    onClick: this._playInStream.bind(this)
                }, {
                    text: chrome.i18n.getMessage('add'),
                    onClick: this._addToStream.bind(this)
                }, {
                    text: chrome.i18n.getMessage('copyUrl'),
                    onClick: this._copyUrl.bind(this)
                }, {
                    text: chrome.i18n.getMessage('copyTitleAndUrl'),
                    onClick: this._copyTitleAndUrl.bind(this)
                }, {
                    text: chrome.i18n.getMessage('watchOnYouTube'),
                    onClick: this._watchOnYouTube.bind(this)
                }]
            );
        },
        
        _addToStream: function() {
            ContextMenuActions.addSongsToStream(this.model.get('song'));
        },

        _playInStream: function () {
            ContextMenuActions.playSongsInStream(this.model.get('song'));
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

        _watchOnYouTube: function () {
            var song = this.model.get('song');
            ContextMenuActions.watchOnYouTube(song.get('id'), song.get('url'));
        }
    });

    return SearchResultView;
});