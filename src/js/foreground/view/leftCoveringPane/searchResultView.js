define([
    'foreground/collection/contextMenuItems',
    'foreground/view/addToStreamButtonView',
    'foreground/view/multiSelectListItemView',
    'foreground/view/playInStreamButtonView',
    'foreground/view/saveToPlaylistButtonView',
    'foreground/view/behavior/tooltip',
    'text!template/listItem.html'
], function (ContextMenuItems, AddToStreamButtonView, MultiSelectListItemView, PlayInStreamButtonView, SaveToPlaylistButtonView, Tooltip, ListItemTemplate) {
    'use strict';

    var StreamItems = chrome.extension.getBackgroundPage().StreamItems;

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
            'dblclick': 'playInStream'
        }),
        
        behaviors: {
            Tooltip: {
                behaviorClass: Tooltip
            }
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
        },

        playInStream: function () {
            StreamItems.addSongs(this.model.get('song'), {
                playOnAdd: true
            });
        }
    });

    return SearchResultView;
});