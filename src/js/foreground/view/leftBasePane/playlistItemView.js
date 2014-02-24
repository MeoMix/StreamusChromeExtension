define([
    'text!template/playlistItem.html',
    'foreground/collection/contextMenuItems',
    'background/collection/streamItems',
    'common/enum/listItemType',
    'foreground/view/playInStreamButtonView',
    'foreground/view/addToStreamButtonView',
    'foreground/view/deleteButtonView'
], function (PlaylistItemTemplate, ContextMenuItems, StreamItems, ListItemType, PlayInStreamButtonView, AddToStreamButtonView, DeleteButtonView) {
    'use strict';

    var PlaylistItemView = Backbone.Marionette.Layout.extend({
        
        className: 'listItem playlistItem multiSelectItem',
        
        template: _.template(PlaylistItemTemplate),
        
        templateHelpers: function () {
            return {
                instant: this.instant,
                hdMessage: chrome.i18n.getMessage('hd')
            };
        },
        
        attributes: function () {
            return {
                'data-id': this.model.get('id'),
                'data-type': ListItemType.PlaylistItem
            };
        },
        
        //  Usually lazy-load images, but if a option is given -- allow for instant loading.
        instant: false,
        
        events: {
            'contextmenu': 'showContextMenu',
            'dblclick': 'playInStream'
        },
        
        ui: {
            imageThumbnail: 'img.item-thumb'
        },
        
        modelEvents: {
            'destroy': 'remove',
            'change:selected': 'setSelectedClass'
        },
        
        regions: {
            playInStreamRegion: '.play-in-stream-region',
            addToStreamRegion: '.add-to-stream-region',
            deleteRegion: '.delete-region'
        },
        
        onRender: function () {
            this.setSelectedClass();

            this.playInStreamRegion.show(new PlayInStreamButtonView({
                model: this.model.get('video')
            }));

            this.addToStreamRegion.show(new AddToStreamButtonView({
                model: this.model.get('video')
            }));

            this.deleteRegion.show(new DeleteButtonView({
                model: this.model
            }));
        },
        
        initialize: function (options) {
            this.instant = options && options.instant || this.instant;
        },
        
        setSelectedClass: function () {
            this.$el.toggleClass('selected', this.model.get('selected'));
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
                    text: chrome.i18n.getMessage('add'),
                    onClick: function() {
                        StreamItems.addByVideo(self.model.get('video'));
                    }
                }, {
                    text: chrome.i18n.getMessage('play'),
                    onClick: function() {
                        StreamItems.addByVideo(self.model.get('video'), true);
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

        }

    });

    return PlaylistItemView;
});