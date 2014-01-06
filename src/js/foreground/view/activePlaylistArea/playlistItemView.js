define([
    'foreground/view/genericForegroundView',
    'text!template/playlistItem.html',
    'foreground/collection/contextMenuGroups',
    'foreground/collection/streamItems'
], function (GenericForegroundView, PlaylistItemTemplate, ContextMenuGroups, StreamItems) {
    'use strict';

    var PlaylistItemView = GenericForegroundView.extend({
        
        className: 'listItem playlistItem',
        
        template: _.template(PlaylistItemTemplate),
        
        attributes: function() {
            return {
                'data-playlistitemid': this.model.get('id')
            };
        },
        
        //  Usually lazy-load images, but if a option is given -- allow for instant loading.
        instant: false,
        
        events: {
            'contextmenu': 'showContextMenu',
            'click i.playInStream': 'playInStream',
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
            
            return this;
        },
        
        initialize: function (options) {
            this.instant = options && options.instant || false;

            this.listenTo(this.model, 'destroy', this.remove);
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

            //  Don't add the item to the stream as well
            return false;
        }

    });

    return PlaylistItemView;
});