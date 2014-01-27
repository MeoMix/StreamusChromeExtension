define([
    'foreground/view/genericForegroundView',
    'foreground/collection/contextMenuGroups',
    'common/model/utility',
    'foreground/collection/streamItems',
    'text!template/streamItem.html',
    'foreground/collection/folders',
    'foreground/model/buttons/playPauseButton',
    'foreground/model/player',
    'enum/listItemType'
], function (GenericForegroundView, ContextMenuGroups, Utility, StreamItems, StreamItemTemplate, Folders, PlayPauseButton, Player, ListItemType) {
    'use strict';

    var StreamItemView = GenericForegroundView.extend({
        
        className: 'listItem streamItem',

        template: _.template(StreamItemTemplate),
        //  Usually lazy-load images, but if a option is given -- allow for instant loading.
        instant: false,
        
        attributes: function () {

            return {
                'data-id': this.model.get('id'),
                'data-type': ListItemType.StreamItem
            };
        },
        
        events: {
            'click': 'select',
            'click button.delete': 'doDelete',
            'click button.playInStream': 'play',
            'contextmenu': 'showContextMenu',
            //  Capture double-click events to prevent bubbling up to main dblclick event.
            'dblclick': 'togglePlayingState',
            'dblclick button.playInStream': 'play'
        },

        render: function () {
            this.$el.html(this.template(
                _.extend(this.model.toJSON(), {
                    //  Mix in chrome to reference internationalize.
                    'chrome.i18n': chrome.i18n,
                    'instant': this.instant
                })
            ));
            
            this.$el.toggleClass('selected', this.model.get('selected'));
            this.initializeTooltips();
            
            return this;
        },

        initialize: function (options) {
            this.instant = options && options.instant || false;
            
            this.listenTo(this.model, 'destroy', this.remove);
            this.listenTo(this.model, 'change:selected', this.toggleSelected);
        },

        select: function () {
            this.model.set('selected', true);
        },

        togglePlayingState: function () {
            PlayPauseButton.tryTogglePlayerState();
        },
        
        doDelete: function () {
            this.model.destroy();

            //  Don't allow click to bubble up to the list item and cause a selection.
            return false;
        },
        
        //  Force the view to reflect the model's selected class. It's important to do this here, and not through render always, because
        //  render will cause the lazy-loaded image to be reset.
        toggleSelected: function () {
            this.$el.toggleClass('selected', this.model.get('selected'));
        },

        showContextMenu: function(event) {
            var self = this;

            event.preventDefault();

            ContextMenuGroups.reset();
            
            var activePlaylist = Folders.getActiveFolder().getActivePlaylist();
            var videoAlreadyExists = activePlaylist.get('items').videoAlreadyExists(self.model.get('video'));

            ContextMenuGroups.add({
                items: [{
                    text: chrome.i18n.getMessage('save'),
                    //  TODO: i18n
                    title: videoAlreadyExists ? 'Duplicates not allowed' : '',
                    disabled: videoAlreadyExists,
                    onClick: function () {
                        if (!videoAlreadyExists) {
                            activePlaylist.addByVideo(self.model.get('video'));
                        }
                    }
                }, {
                    text: chrome.i18n.getMessage('copyUrl'),
                    onClick: function () {

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
                    text: chrome.i18n.getMessage('delete'),
                    onClick: function () {
                        self.model.destroy();
                    }
                }, {
                    text: chrome.i18n.getMessage('banUntilClear'),
                    disabled: StreamItems.getRelatedVideos().length < 5,
                    onClick: function () {
                        StreamItems.ban(self.model);
                        self.model.destroy();
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

        play: _.debounce(function () {
            
            if (this.model.get('selected')) {
                Player.play();
            } else {
                Player.playOnceVideoChanges();
                this.select();
            }
 
            //  Don't allow dblclick to bubble up to the list item and cause a play.
            return false;
        }, 100, true)
    });

    return StreamItemView;
});