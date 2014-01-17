define([
    'foreground/view/genericForegroundView',
    'text!template/playlistItem.html',
    'foreground/collection/contextMenuGroups',
    'foreground/collection/streamItems',
    'enum/listItemType'
], function (GenericForegroundView, PlaylistItemTemplate, ContextMenuGroups, StreamItems, ListItemType) {
    'use strict';

    var PlaylistItemView = GenericForegroundView.extend({
        
        className: 'listItem playlistItem',
        
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
            'contextmenu': 'showContextMenu',
            'dblclick': 'playInStream',
            'click i.playInStream': 'playInStream',
            'click i.addToStream': 'addToStream',
            'click i.delete': 'doDelete'
        },
        
        render: function () {
            
            this.$el.html(this.template(
                _.extend(this.model.toJSON(), {
                    //  Mix in chrome to reference internationalize.
                    'chrome.i18n': chrome.i18n,
                    'instant': this.instant
                })
            ));
            
            this.setHighlight();

            return this;
        },
        
        initialize: function (options) {
            this.instant = options && options.instant || false;

            this.listenTo(this.model, 'destroy', this.remove);
            this.listenTo(this.model, 'change:selected', this.setHighlight);
        },
        
        setHighlight: function () {
            this.$el.toggleClass('selected', this.model.get('selected'));
        },
        
        doDelete: function () {
            this.model.destroy();
        },

        showContextMenu: function (event) {

            var self = this;

            event.preventDefault();
            ContextMenuGroups.reset();
        
            ContextMenuGroups.add({
                items: [{
                    text: chrome.i18n.getMessage('copyUrl'),
                    onClick: function () {
                        chrome.extension.sendMessage({
                            method: 'copy',
                            text: self.model.get('video').get('url')
                        });
                    }
                }, {
                    text: chrome.i18n.getMessage('copyTitleAndUrl'),
                    onClick: function () {

                        chrome.extension.sendMessage({
                            method: 'copy',
                            text: '"' + self.model.get('title') + '" - ' + self.model.get('video').get('url')
                        });
                    }
                }, {
                    text: chrome.i18n.getMessage('deleteVideo'),
                    onClick: function () {
                        self.model.destroy();
                    }
                }, {
                    text: chrome.i18n.getMessage('enqueue'),
                    onClick: function () {

                        var video = self.model.get('video');
                        StreamItems.addByVideo(video);

                    }
                }, {
                    text: chrome.i18n.getMessage('play'),
                    onClick: function () {

                        var video = self.model.get('video');
                        StreamItems.addByVideo(video, true);

                    }
                }, {
                    text: chrome.i18n.getMessage('watchOnYouTube'),
                    onClick: function () {

                        chrome.tabs.create({
                            url: self.model.get('video').get('url')
                        });

                    }
                }]

            });

        },
        
        playInStream: function () {
            StreamItems.addByPlaylistItem(this.model, true);
        },
        
        addToStream: function() {
            StreamItems.addByPlaylistItem(this.model, false);
        }

    });

    return PlaylistItemView;
});