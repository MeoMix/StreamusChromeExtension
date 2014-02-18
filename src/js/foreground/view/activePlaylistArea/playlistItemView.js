define([
    'foreground/model/foregroundViewManager',
    'text!template/playlistItem.html',
    'foreground/collection/contextMenuItems',
    'foreground/collection/streamItems',
    'enum/listItemType'
], function (ForegroundViewManager, PlaylistItemTemplate, ContextMenuItems, StreamItems, ListItemType) {
    'use strict';

    var PlaylistItemView = Backbone.Marionette.ItemView.extend({
        className: 'listItem playlistItem multiSelectItem',
        
        template: _.template(PlaylistItemTemplate),
        
        attributes: function() {
            return {
                'data-id': this.model.get('id'),
                'data-type': ListItemType.PlaylistItem
            };
        },
        
        //  Usually lazy-load images, but if a option is given -- allow for instant loading.
        instant: false,
        
        events: {
            'click button.addToStream': 'addToStream',
            'click button.delete': 'doDelete',
            'click button.playInStream': 'playInStream',
            'contextmenu': 'showContextMenu',
            //  Capture double-click events to prevent bubbling up to main dblclick event.
            'dblclick': 'playInStream',
            'dblclick button.addToStream': 'addToStream',
            'dblclick button.playInStream': 'playInStream',
        },
        
        ui: {
            imageThumbnail: 'img.item-thumb'
        },
        
        templateHelpers: function() {
            return {
                instant: this.instant,
                hdMessage: chrome.i18n.getMessage('hd'),
                playMessage: chrome.i18n.getMessage('play'),
                enqueueMessage: chrome.i18n.getMessage('enqueue'),
                deleteMessage: chrome.i18n.getMessage('delete')
            };
        },
        
        onRender: function () {
            this.setHighlight();
        },
        
        modelEvents: {
            'destroy': 'remove',
            'change:selected': 'setHighlight'
        },
        
        initialize: function (options) {
            this.instant = options && options.instant || this.instant;
            ForegroundViewManager.subscribe(this);
        },
        
        setHighlight: function () {
            this.$el.toggleClass('selected', this.model.get('selected'));
        },
        
        doDelete: function () {
            this.model.destroy();
            
            //  Don't allow click to bubble up to the list item and cause a selection.
            return false;
        },

        showContextMenu: function (event) {
            event.preventDefault();

            var self = this;

            ContextMenuItems.reset([{
                    text: chrome.i18n.getMessage('copyUrl'),
                    onClick: function() {
                        chrome.extension.sendMessage({
                            method: 'copy',
                            text: self.model.get('video').get('url')
                        });
                    }
                }, {
                    text: chrome.i18n.getMessage('copyTitleAndUrl'),
                    onClick: function() {

                        chrome.extension.sendMessage({
                            method: 'copy',
                            text: '"' + self.model.get('title') + '" - ' + self.model.get('video').get('url')
                        });
                    }
                }, {
                    text: chrome.i18n.getMessage('deleteVideo'),
                    onClick: function() {
                        self.model.destroy();
                    }
                }, {
                    text: chrome.i18n.getMessage('enqueue'),
                    onClick: function() {

                        var video = self.model.get('video');
                        StreamItems.addByVideo(video);

                    }
                }, {
                    text: chrome.i18n.getMessage('play'),
                    onClick: function() {

                        var video = self.model.get('video');
                        StreamItems.addByVideo(video, true);

                    }
                }, {
                    text: chrome.i18n.getMessage('watchOnYouTube'),
                    onClick: function() {

                        chrome.tabs.create({
                            url: self.model.get('video').get('url')
                        });

                    }
                }]
            );

        },
        
        //  TODO: Is there a way to keep these actions DRY across multiple views?
        playInStream: _.debounce(function () {
            StreamItems.addByPlaylistItem(this.model, true);
            
            //  Don't allow dblclick to bubble up to the list item and cause a play.
            return false;
        }, 100, true),
        
        addToStream: _.debounce(function() {
            StreamItems.addByPlaylistItem(this.model, false);

            //  Don't allow dblclick to bubble up to the list item and cause a play.
            return false;
        }, 100, true)

    });

    return PlaylistItemView;
});