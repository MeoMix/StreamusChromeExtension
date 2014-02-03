define([
    'foreground/view/genericForegroundView',
    'foreground/model/foregroundViewManager',
    'text!template/videoSearchResult.html',
    'foreground/collection/contextMenuGroups',
    'foreground/collection/videoSearchResults',
    'foreground/collection/streamItems',
    'foreground/collection/folders',
    'foreground/view/prompt/saveVideosPromptView',
    'enum/listItemType'
], function (GenericForegroundView, ForegroundViewManager, VideoSearchResultTemplate, ContextMenuGroups, VideoSearchResults, StreamItems, Folders, SaveVideosPromptView, ListItemType) {
    'use strict';

    var VideoSearchResultView = Backbone.Marionette.ItemView.extend({
        
        className: 'listItem videoSearchResult multiSelectItem',

        template: _.template(VideoSearchResultTemplate),
        
        attributes: function () {
            return {
                'data-id': this.model.get('id'),
                'data-type': ListItemType.VideoSearchResult
            };
        },
        
        events: {
            'click button.playInStream': 'playInStream',
            'click button.addToStream': 'addToStream',
            'click button.save': 'saveToPlaylist',
            'contextmenu': 'showContextMenu',
            //  Capture double-click events to prevent bubbling up to main dblclick event.
            'dblclick': 'playInStream',
            'dblclick button.playInStream': 'playInStream',
            'dblclick button.save': 'saveToPlaylist',
            'dblclick button.addToStream': 'addToStream'
        },
        
        ui: {
            imageThumbnail: 'img.item-thumb'
        },
        
        templateHelpers: function () {
            return {
                //  Mix in chrome to reference internationalize.
                'chrome.i18n': chrome.i18n,
                instant: this.instant
            };
        },
        
        modelEvents: {
            'change:selected': 'setHighlight',
            'destroy': 'remove'
        },
        
        onRender: function () {
            this.setHighlight();
            GenericForegroundView.prototype.initializeTooltips.call(this);
        },

        initialize: function (options) {
            this.instant = options && options.instant !== undefined ? options.instant : this.instant;

            ForegroundViewManager.get('views').push(this);
        },
        
        setHighlight: function () {
            this.$el.toggleClass('selected', this.model.get('selected'));
        },
        
        //  TODO: Is there a way to keep these actions DRY across multiple views?
        playInStream: _.debounce(function () {
            var video = this.model.get('video');
            StreamItems.addByVideo(video, true);
            
            //  Don't allow dblclick to bubble up to the list item and cause a play.
            return false;
        }, 100, true),
        
        addToStream: _.debounce(function() {
            var video = this.model.get('video');
            StreamItems.addByVideo(video, false);

            //  Don't allow dblclick to bubble up to the list item and cause a play.
            return false;
        }, 100, true),
        
        saveToPlaylist: _.debounce(function () {
           
            var video = this.model.get('video');

            var saveVideosPromptView = new SaveVideosPromptView({
                videos: [video]
            });
            
            saveVideosPromptView.fadeInAndShow();

            //  Don't allow dblclick to bubble up to the list item and cause a play.
            return false;
        }, 100, true),
        
        showContextMenu: function (event) {

            var video = this.model.get('video');
            
            event.preventDefault();

            ContextMenuGroups.reset();
            
            ContextMenuGroups.add({
                items: [{
                    text: chrome.i18n.getMessage('play'),
                    onClick: function () {
                        StreamItems.addByVideo(video, true);
                    }
                }, {
                    text: chrome.i18n.getMessage('enqueue'),
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
            });

        }
    });

    return VideoSearchResultView;
});