define([
    'background/collection/streamItems',
    'common/enum/listItemType',
    'foreground/collection/contextMenuItems',
    'foreground/view/addToStreamButtonView',
    'foreground/view/multiSelectListItemView',
    'foreground/view/playInStreamButtonView',
    'foreground/view/saveToPlaylistButtonView',
    'text!template/videoSearchResult.html'
], function (StreamItems, ListItemType, ContextMenuItems, AddToStreamButtonView, MultiSelectListItemView, PlayInStreamButtonView, SaveToPlaylistButtonView, VideoSearchResultTemplate) {
    'use strict';

    var VideoSearchResultView = MultiSelectListItemView.extend({
        
        className: MultiSelectListItemView.prototype.className + ' video-search-result',

        template: _.template(VideoSearchResultTemplate),

        attributes: function () {
            return {
                'data-id': this.model.get('id'),
                'data-type': ListItemType.VideoSearchResult
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
                model: this.model.get('video')
            }));
            
            this.addToStreamRegion.show(new AddToStreamButtonView({
                model: this.model.get('video')
            }));
            
            this.saveToPlaylistRegion.show(new SaveToPlaylistButtonView({
                model: this.model.get('video')
            }));

            this.setSelectedClass();
        },
        
        playInStream: function () {
            this.playInStreamRegion.currentView.playInStream();
        },
        
        showContextMenu: function (event) {
            event.preventDefault();
            
            var video = this.model.get('video');
            
            ContextMenuItems.reset([{
                    text: chrome.i18n.getMessage('play'),
                    onClick: function () {
                        StreamItems.addByVideo(video, true);
                    }
                }, {
                    text: chrome.i18n.getMessage('add'),
                    onClick: function () {
                        StreamItems.addByVideo(video, false);
                    }
                }, {
                    text: chrome.i18n.getMessage('copyUrl'),
                    onClick: function () {
                        chrome.extension.sendMessage({
                            method: 'copy',
                            text: video.get('url')
                        });
                    }
                }, {
                    text: chrome.i18n.getMessage('copyTitleAndUrl'),
                    onClick: function () {
                        chrome.extension.sendMessage({
                            method: 'copy',
                            text: '"' + video.get('title') + '" - ' + video.get('url')
                        });
                    }
                }, {
                    text: chrome.i18n.getMessage('watchOnYouTube'),
                    onClick: function () {
                        chrome.tabs.create({
                            url: video.get('url')
                        });
                    }
                }]
            );

        }
    });

    return VideoSearchResultView;
});