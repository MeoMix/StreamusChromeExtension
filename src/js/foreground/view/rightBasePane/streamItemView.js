define([
    'foreground/collection/contextMenuItems',
    'common/model/utility',
    'background/collection/streamItems',
    'text!template/streamItem.html',
    'background/collection/playlists',
    'background/model/buttons/playPauseButton',
    'background/model/player',
    'common/enum/listItemType',
    'background/model/user',
    'foreground/view/deleteButtonView',
    'foreground/view/saveToPlaylistButtonView'
], function (ContextMenuItems, Utility, StreamItems, StreamItemTemplate, Playlists, PlayPauseButton, Player, ListItemType, User, DeleteButtonView, SaveToPlaylistButtonView) {
    'use strict';

    var StreamItemView = Backbone.Marionette.Layout.extend({
        
        className: 'listItem streamItem multiSelectItem',

        template: _.template(StreamItemTemplate),
        
        templateHelpers: function () {
            return {
                hdMessage: chrome.i18n.getMessage('hd'),
                playMessage: chrome.i18n.getMessage('play'),
                instant: this.instant
            };
        },
        
        instant: false,

        attributes: function () {
            return {
                'data-id': this.model.get('id'),
                'data-type': ListItemType.StreamItem
            };
        },
        
        events: {
            'click button.playInStream': 'play',
            'contextmenu': 'showContextMenu',
            //  Capture double-click events to prevent bubbling up to main dblclick event.
            'dblclick': 'activateOrToggleState',
            'dblclick button.playInStream': 'play'
        },
        
        modelEvents: {
            'change:active': 'setActiveClass',
            'change:selected': 'setSelectedClass',
            'destroy': 'remove'
        },
        
        ui: {
            'imageThumbnail': 'img.item-thumb'
        },

        regions: {
            deleteRegion: '.delete-region',
            saveToPlaylistRegion: '.save-to-playlist-region'
        },
        
        onShow: function () {
            //  TODO: setActiveClass handles this, but is called in onRender which probably doesn't work.
            var active = this.model.get('active');

            //  If the stream item is active -- ensure it is instantly visible.
            if (active) {
                //  Pass 0 into scrollIntoView to have no animation/show instantly.
                this.$el.scrollIntoView(0);
            }
        },

        onRender: function () {
            this.setActiveClass();
            this.setSelectedClass();

            this.deleteRegion.show(new DeleteButtonView({
                model: this.model
            }));
            
            this.saveToPlaylistRegion.show(new SaveToPlaylistButtonView({
                model: this.model.get('video')
            }));

            this.applyTooltips();
        },
            
        initialize: function (options) {
            this.instant = options && options.instant !== undefined ? options.instant : this.instant;
        },

        activateOrToggleState: function () {
            if (!this.model.get('active')) {
                this.model.set('active', true);
            } else {
                PlayPauseButton.tryTogglePlayerState();
            }
        },
 
        //  Force the view to reflect the model's active class. It's important to do this here, and not through render always, because
        //  render will cause the lazy-loaded image to be reset.
        setActiveClass: function () {
            var active = this.model.get('active');
            this.$el.toggleClass('active', active);
            
            if (active) {
                this.$el.scrollIntoView();
            }
        },
        
        //  TODO: Maybe keep DRY with video search results and playlist items by introducing a "Selectable" list item view.
        setSelectedClass: function () {
            this.$el.toggleClass('selected', this.model.get('selected'));
        },

        showContextMenu: function (event) {

            //  Whenever a context menu is shown -- set preventDefault to true to let foreground know to not reset the context menu.
            event.preventDefault();
            var self = this;
            
            var userSignedIn = User.get('signedIn');

            var activePlaylist = Playlists.getActivePlaylist();
            var videoAlreadyExists = false;
            
            if (userSignedIn) {
                videoAlreadyExists = activePlaylist.get('items').videoAlreadyExists(self.model.get('video'));
            }

            var saveTitle = '';
            
            if (userSignedIn && videoAlreadyExists) {
                saveTitle = chrome.i18n.getMessage('duplicatesNotAllowed');
            } else if (!userSignedIn) {
                saveTitle = chrome.i18n.getMessage('cantSaveNotSignedIn');
            }

            ContextMenuItems.reset([{
                    text: chrome.i18n.getMessage('save'),
                    title: saveTitle,
                    disabled: !userSignedIn || videoAlreadyExists,
                    onClick: function () {
                        activePlaylist.addByVideo(self.model.get('video'));
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
            );

        },

        //  TODO: Can I merge this logic with playInStreamButtonView?
        play: _.debounce(function () {
            
            if (this.model.get('active')) {
                Player.play();
            } else {
                Player.playOnceVideoChanges();
                this.activate();
            }
 
            //  Don't allow dblclick to bubble up to the list item and cause a play.
            return false;
        }, 100, true)
    });

    return StreamItemView;
});