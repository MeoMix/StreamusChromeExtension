define([
    'text!template/videoSearchResult.html',
    'foreground/collection/contextMenuItems',
    'background/collection/streamItems',
    'common/enum/listItemType',
    'foreground/view/playInStreamButtonView',
    'foreground/view/addToStreamButtonView',
    'foreground/view/saveToPlaylistButtonView'
], function (VideoSearchResultTemplate, ContextMenuItems, StreamItems, ListItemType, PlayInStreamButtonView, AddToStreamButtonView, SaveToPlaylistButtonView) {
    'use strict';

    var VideoSearchResultView = Backbone.Marionette.Layout.extend({
        
        className: 'listItem videoSearchResult multiSelectItem',

        template: _.template(VideoSearchResultTemplate),
        
        templateHelpers: function () {
            return {
                hdMessage: chrome.i18n.getMessage('hd'),
                instant: this.instant
            };
        },

        attributes: function () {
            return {
                'data-id': this.model.get('id'),
                'data-type': ListItemType.VideoSearchResult
            };
        },
        
        events: {
            'contextmenu': 'showContextMenu',
            'dblclick': 'playInStream',
        },
        
        modelEvents: {
            'change:selected': 'setHighlight',
            'destroy': 'remove'
        },
        
        ui: {
            imageThumbnail: 'img.item-thumb'
        },
        
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

            this.setHighlight();
            this.applyTooltips();
        },
        
        initialize: function (options) {
            this.instant = options && options.instant !== undefined ? options.instant : this.instant;
        },
        
        setHighlight: function () {
            this.$el.toggleClass('selected', this.model.get('selected'));
        },
        
        playInStream: function() {
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