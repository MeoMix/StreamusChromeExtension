define([
    'background/collection/streamItems',
    'common/enum/listItemType',
    'foreground/collection/contextMenuItems',
    'foreground/view/addToStreamButtonView',
    'foreground/view/multiSelectListItemView',
    'foreground/view/playInStreamButtonView',
    'foreground/view/saveToPlaylistButtonView',
    'text!template/searchResult.html'
], function (StreamItems, ListItemType, ContextMenuItems, AddToStreamButtonView, MultiSelectListItemView, PlayInStreamButtonView, SaveToPlaylistButtonView, SearchResultTemplate) {
    'use strict';

    var SearchResultView = MultiSelectListItemView.extend({
        
        className: MultiSelectListItemView.prototype.className + ' search-result',

        template: _.template(SearchResultTemplate),

        attributes: function () {
            return {
                'data-id': this.model.get('id'),
                'data-type': ListItemType.SearchResult
            };
        },
        
        events: _.extend({}, MultiSelectListItemView.prototype.events, {
            'dblclick': 'playInStream'
        }),

        regions: {
            playInStreamRegion: '.play-in-stream-region',
            addToStreamRegion: '.add-to-stream-region',
            saveToPlaylistRegion: '.save-to-playlist-region'
        },
        
        onRender: function () {
            this.playInStreamRegion.show(new PlayInStreamButtonView({
                model: this.model.get('song')
            }));
            
            this.addToStreamRegion.show(new AddToStreamButtonView({
                model: this.model.get('song')
            }));
            
            this.saveToPlaylistRegion.show(new SaveToPlaylistButtonView({
                model: this.model.get('song')
            }));

            this.setSelectedClass();
        },
        
        playInStream: function () {
            this.playInStreamRegion.currentView.playInStream();
        },
        
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