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
                model: this.model.get('source')
            }));
            
            this.addToStreamRegion.show(new AddToStreamButtonView({
                model: this.model.get('source')
            }));
            
            this.saveToPlaylistRegion.show(new SaveToPlaylistButtonView({
                model: this.model.get('source')
            }));

            this.setSelectedClass();
        },
        
        playInStream: function () {
            this.playInStreamRegion.currentView.playInStream();
        },
        
        showContextMenu: function (event) {
            event.preventDefault();
            
            var source = this.model.get('source');
            
            ContextMenuItems.reset([{
                    text: chrome.i18n.getMessage('play'),
                    onClick: function () {
                        StreamItems.addSources(source, {
                            playOnAdd: true
                        });
                    }
                }, {
                    text: chrome.i18n.getMessage('add'),
                    onClick: function () {
                        StreamItems.addSources(source);
                    }
                }, {
                    text: chrome.i18n.getMessage('copyUrl'),
                    onClick: function () {
                        chrome.extension.sendMessage({
                            method: 'copy',
                            text: source.get('url')
                        });
                    }
                }, {
                    text: chrome.i18n.getMessage('copyTitleAndUrl'),
                    onClick: function () {
                        chrome.extension.sendMessage({
                            method: 'copy',
                            text: '"' + source.get('title') + '" - ' + source.get('url')
                        });
                    }
                }, {
                    text: chrome.i18n.getMessage('watchOnYouTube'),
                    onClick: function () {
                        chrome.tabs.create({
                            url: source.get('url')
                        });
                    }
                }]
            );

        }
    });

    return SearchResultView;
});