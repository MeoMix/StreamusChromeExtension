define([
    'foreground/model/foregroundViewManager',
    'foreground/collection/contextMenuItems',
    'common/model/utility',
    'foreground/collection/streamItems',
    'text!template/streamItem.html',
    'foreground/collection/playlists',
    'foreground/model/playPauseButton',
    'foreground/model/player',
    'enum/listItemType',
    'foreground/model/user'
], function (ForegroundViewManager, ContextMenuItems, Utility, StreamItems, StreamItemTemplate, Playlists, PlayPauseButton, Player, ListItemType, User) {
    'use strict';

    var StreamItemView = Backbone.Marionette.ItemView.extend({
        
        className: 'listItem streamItem',

        template: _.template(StreamItemTemplate),
        
        instant: false,

        attributes: function () {
            return {
                'data-id': this.model.get('id'),
                'data-type': ListItemType.StreamItem
            };
        },
        
        events: {
            'click': 'select',
            'click @ui.deleteButton': 'doDelete',
            'click button.playInStream': 'play',
            'contextmenu': 'showContextMenu',
            //  Capture double-click events to prevent bubbling up to main dblclick event.
            'dblclick': 'togglePlayingState',
            'dblclick button.playInStream': 'play'
        },
        
        ui: {
            'imageThumbnail': 'img.item-thumb',
            'deleteButton': 'button.delete'
        },
        
        templateHelpers: function () {
            return {
                hdMessage: chrome.i18n.getMessage('hd'),
                playMessage: chrome.i18n.getMessage('play'),
                deleteMessage: chrome.i18n.getMessage('delete'),
                instant: this.instant             
            };
        },
        
        modelEvents: {
            'change:selected': 'toggleSelected',
            'destroy': 'remove'
        },

        onRender: function () {
            this.$el.toggleClass('selected', this.model.get('selected'));
            this.applyTooltips();
        },
            
        initialize: function (options) {
            this.instant = options && options.instant !== undefined ? options.instant : this.instant;
            ForegroundViewManager.subscribe(this);
        },

        select: function () {
            this.model.set('selected', true);
        },

        togglePlayingState: function () {
            PlayPauseButton.tryTogglePlayerState();
        },
        
        doDelete: function () {
            //  qtip does this odd "fly out" when the view is removed -- destroy the active tooltip before the view to prevent.
            this.ui.deleteButton.qtip('api').destroy(true);
            this.model.destroy();

            //  Don't allow click to bubble up to the list item and cause a selection.
            return false;
        },
        
        //  Force the view to reflect the model's selected class. It's important to do this here, and not through render always, because
        //  render will cause the lazy-loaded image to be reset.
        toggleSelected: function () {
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