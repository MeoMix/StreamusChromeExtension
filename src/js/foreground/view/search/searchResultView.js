define([
    'foreground/collection/contextMenuItems',
    'foreground/model/contextMenuActions',
    'foreground/view/listItemView',
    'foreground/view/behavior/itemViewMultiSelect',
    'foreground/view/listItemButton/addSongButtonView',
    'foreground/view/listItemButton/playSongButtonView',
    'foreground/view/listItemButton/saveSongButtonView',
    'text!template/search/searchResult.html'
], function (ContextMenuItems, ContextMenuActions, ListItemView, ItemViewMultiSelect, AddSongButtonView, PlaySongButtonView, SaveSongButtonView, SearchResultTemplate) {
    'use strict';

    var SearchResultView = ListItemView.extend({
        className: ListItemView.prototype.className + ' search-result listItem--medium',
        template: _.template(SearchResultTemplate),

        buttonViews: [PlaySongButtonView, AddSongButtonView, SaveSongButtonView],
        
        events: _.extend({}, ListItemView.prototype.events, {
            'dblclick': '_playInStream'
        }),
        
        behaviors: _.extend({}, ListItemView.prototype.behaviors, {
            ItemViewMultiSelect: {
                behaviorClass: ItemViewMultiSelect
            }
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