define([
    'foreground/view/genericForegroundView',
    'text!template/playlistItem.html',
    'foreground/collection/contextMenuGroups',
    'foreground/collection/streamItems',
    'enum/listItemType'
], function (GenericForegroundView, PlaylistItemTemplate, ContextMenuGroups, StreamItems, ListItemType) {
    'use strict';

    var PlaylistItemView = GenericForegroundView.extend({
        
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
            'click i.addToStream': 'addToStream',
            'click i.delete': 'doDelete',
            'click i.playInStream': 'playInStream',
            'contextmenu': 'showContextMenu',
            //  Capture double-click events to prevent bubbling up to main dblclick event.
            'dblclick': 'playInStream',
            'dblclick i.addToStream': 'addToStream',
            'dblclick i.playInStream': 'playInStream',
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
            
            //  Don't allow click to bubble up to the list item and cause a selection.
            return false;
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
        
        //  TODO: Is there a way to keep these actions DRY across multiple views?
        playInStream: _.debounce(function () {
            StreamItems.addByVideo(this.model, true);
            
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