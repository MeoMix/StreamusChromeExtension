define([
    'foreground/model/foregroundViewManager',
    'text!template/videoSearchResult.html',
    'foreground/collection/contextMenuItems',
    'background/collection/streamItems',
    'foreground/view/prompt/saveVideosPromptView',
    'enum/listItemType',
    'background/model/user'
], function (ForegroundViewManager, VideoSearchResultTemplate, ContextMenuItems, StreamItems, SaveVideosPromptView, ListItemType, User) {
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
            'click @ui.saveButton': 'saveToPlaylist',
            'contextmenu': 'showContextMenu',
            //  Capture double-click events to prevent bubbling up to main dblclick event.
            'dblclick': 'playInStream',
            'dblclick button.playInStream': 'playInStream',
            'dblclick button.save': 'saveToPlaylist',
            'dblclick button.addToStream': 'addToStream'
        },
        
        ui: {
            imageThumbnail: 'img.item-thumb',
            saveButton: 'button.save'
        },
        
        templateHelpers: function () {
            return {
                hdMessage: chrome.i18n.getMessage('hd'),
                playMessage: chrome.i18n.getMessage('play'),
                enqueueMessage: chrome.i18n.getMessage('enqueue'),
                saveMessage: chrome.i18n.getMessage('save'),
                userSignedIn: User.get('signedIn'),
                cantSaveNotSignedInMessage: chrome.i18n.getMessage('cantSaveNotSignedIn'),
                instant: this.instant
            };
        },
      
        modelEvents: {
            'change:selected': 'setHighlight',
            'destroy': 'remove'
        },
        
        onRender: function () {
            this.setHighlight();
            this.applyTooltips();
        },

        initialize: function (options) {
            this.instant = options && options.instant !== undefined ? options.instant : this.instant;
            ForegroundViewManager.subscribe(this);
        },
        
        setHighlight: function () {
            this.$el.toggleClass('selected', this.model.get('selected'));
        },
        
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
            // Return false even on disabled button click so the click event does not bubble up and select the item. 
            if (!this.ui.saveButton.hasClass('disabled')) {
                var video = this.model.get('video');

                var saveVideosPromptView = new SaveVideosPromptView({
                    videos: [video]
                });

                saveVideosPromptView.fadeInAndShow();
            }

            //  Don't allow dblclick to bubble up to the list item and cause a play.
            return false;
        }, 100, true),
        
        showContextMenu: function (event) {
            event.preventDefault();
            
            var video = this.model.get('video');
            
            ContextMenuItems.reset([{
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
            );

        }
    });

    return VideoSearchResultView;
});