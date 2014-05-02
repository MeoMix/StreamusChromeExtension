define([
    'common/enum/listItemType',
    'foreground/collection/contextMenuItems',
    'foreground/view/addToStreamButtonView',
    'foreground/view/multiSelectListItemView',
    'foreground/view/playInStreamButtonView',
    'foreground/view/saveToPlaylistButtonView',
    'text!template/listItem.html'
], function (ListItemType, ContextMenuItems, AddToStreamButtonView, MultiSelectListItemView, PlayInStreamButtonView, SaveToPlaylistButtonView, ListItemTemplate) {
    'use strict';

    var StreamItems = chrome.extension.getBackgroundPage().StreamItems;

    var SearchResultView = MultiSelectListItemView.extend({
        
        className: MultiSelectListItemView.prototype.className + ' search-result',

        template: _.template(ListItemTemplate),

        attributes: function () {
            return {
                'data-id': this.model.get('id'),
                'data-type': ListItemType.SearchResult
            };
        },

        buttonViews: [PlayInStreamButtonView, AddToStreamButtonView, SaveToPlaylistButtonView],
        
        showContextMenu: function (event) {
            event.preventDefault();
            
            var song = this.model.get('song');
            
            ContextMenuItems.reset([{
                    text: chrome.i18n.getMessage('play'),
                    onClick: function () {
                        StreamItems.addSongs(song, {
                            playOnAdd: true
                        });
                    }
                }, {
                    text: chrome.i18n.getMessage('add'),
                    onClick: function () {
                        StreamItems.addSongs(song);
                    }
                }, {
                    text: chrome.i18n.getMessage('copyUrl'),
                    onClick: function () {
                        chrome.extension.sendMessage({
                            method: 'copy',
                            text: song.get('url')
                        });
                    }
                }, {
                    text: chrome.i18n.getMessage('copyTitleAndUrl'),
                    onClick: function () {
                        chrome.extension.sendMessage({
                            method: 'copy',
                            text: '"' + song.get('title') + '" - ' + song.get('url')
                        });
                    }
                }, {
                    text: chrome.i18n.getMessage('watchOnYouTube'),
                    onClick: function () {
                        chrome.tabs.create({
                            url: song.get('url')
                        });
                    }
                }]
            );

        }
    });

    return SearchResultView;
});