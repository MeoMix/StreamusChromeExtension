//  This is the list of playlists on the playlists tab.
define([
    'text!../template/activeFolder.htm',
    'contextMenuGroups',
    'utility',
    'dataSource',
    'streamItems',
    'playlistView',
    'deletePlaylistView',
    'editPlaylistView',
    'genericPromptView',
    'createPlaylistView'
], function (ActiveFolderTemplate, ContextMenuGroups, Utility, DataSource, StreamItems, PlaylistView, DeletePlaylistView, EditPlaylistView, GenericPromptView, CreatePlaylistView) {
    'use strict';

    var ActiveFolderView = Backbone.View.extend({
        
        tagName: 'ul',

        template: _.template(ActiveFolderTemplate),

        events: {
            'contextmenu': 'showContextMenu',
            'contextmenu li': 'showItemContextMenu',
            'click li': 'selectPlaylist'
        },
        
        attributes: {
            'id': 'activeFolderView'
        },
        
        //  Refreshes the playlist display with the current playlist information.
        render: function () {
            this.$el.html(this.template(this.model.toJSON()));
            
            //  TODO: Change this to a template.
            var activeFolder = this.model;

            if (activeFolder.get('playlists').length > 0) {

                //  Build up the ul of li's representing each playlist.
                var listItems = activeFolder.get('playlists').map(function(playlist) {
                    var playlistView = new PlaylistView({
                        model: playlist
                    });

                    return playlistView.render().el;
                });

                //  Do this all in one DOM insertion to prevent lag in large folders.
                this.$el.append(listItems);

                //  TODO: This is probably partially handled by the PlaylistView not ActiveFolderView
                //  TODO: I presume this is still useful, but activePlaylistItemsView doesn't have it so I need to double check.
                var activePlaylist = this.model.getActivePlaylist();
                this.visuallySelectPlaylist(activePlaylist);
            }

            return this;
        },
        
        initialize: function () {

            //  TODO: Sortable.
            var playlists = this.model.get('playlists');
            
            var self = this;

            this.listenTo(playlists, 'change:active', function (playlist, isActive) {

                if (isActive) {
                    self.visuallySelectPlaylist(playlist);
                } else {
                    //  TODO: Change from loaded to active.
                    self.$el.find('li').removeClass('loaded');
                }

            });

            //  TODO: Do I even call playlists.reset anymore?
            this.listenTo(playlists, 'reset empty', this.render);
            this.listenTo(playlists, 'add', this.addItem);

            Utility.scrollChildElements(this.el, 'span.playlitTitle');

            //  todo: find a place for this
            var activePlaylist = this.model.getActivePlaylist();
            this.scrollItemIntoView(activePlaylist, false);
        },

        addItem: function (playlist) {

            var playlistView = new PlaylistView({
                model: playlist
            });

            var element = playlistView.render().$el;

            if (this.$el.find('.playlist').length > 0) {

                var playlists = this.model.get('playlists');

                var currentPlaylistIndex = playlists.indexOf(playlist);

                var previousPlaylistId = playlists.at(currentPlaylistIndex - 1).get('id');

                var previousPlaylistElement = this.$el.find('.playlist[data-playlistid="' + previousPlaylistId + '"]');

                element.insertAfter(previousPlaylistElement);

            } else {
                element.appendTo(this.$el);
            }

            this.scrollItemIntoView(playlist, true);
        },
        
        showContextMenu: function(event) {

            //  Whenever a context menu is shown -- set preventDefault to true to let foreground know to not reset the context menu.
            event.preventDefault();

            if (event.target === event.currentTarget) {
                //  Didn't bubble up from a child -- clear groups.
                ContextMenuGroups.reset();
            }

            ContextMenuGroups.add({
                items: [{
                    text: chrome.i18n.getMessage('createPlaylist'),
                    onClick: function() {

                        var createPlaylistPromptView = new GenericPromptView({
                            title: chrome.i18n.getMessage('createPlaylist'),
                            okButtonText: chrome.i18n.getMessage('saveButtonText'),
                            model: new CreatePlaylistView
                        });
                        
                        createPlaylistPromptView.fadeInAndShow();

                    }
                }]
            });
            
        },
        
        showItemContextMenu: function (event) {

            event.preventDefault();
            ContextMenuGroups.reset();
            
            var clickedPlaylistId = $(event.currentTarget).data('playlistid');
            var clickedPlaylist = this.model.get('playlists').get(clickedPlaylistId);

            var isEmpty = clickedPlaylist.get('items').length === 0;

            //  Don't allow deleting of the last playlist in a folder ( at least for now )
            var isDeleteDisabled = this.model.get('playlists').length === 0;
  
            ContextMenuGroups.add({
                items: [{
                    //  No point in sharing an empty playlist...
                    disabled: isEmpty,
                    title: isEmpty ? chrome.i18n.getMessage("sharePlaylistNoShareWarning") : '',
                    text: chrome.i18n.getMessage("copyUrl"),
                    onClick: function () {

                        clickedPlaylist.getShareCode(function (shareCode) {

                            var shareCodeShortId = shareCode.get('shortId');
                            var urlFriendlyEntityTitle = shareCode.get('urlFriendlyEntityTitle');

                            var playlistShareUrl = 'http://share.streamus.com/playlist/' + shareCodeShortId + '/' + urlFriendlyEntityTitle;

                            chrome.extension.sendMessage({
                                method: 'copy',
                                text: playlistShareUrl
                            });

                        });

                    }
                }, {
                    text: chrome.i18n.getMessage("delete"),
                    disabled: isDeleteDisabled,
                    title: isDeleteDisabled ? chrome.i18n.getMessage("deletePlaylistDisabled") : '',
                    onClick: function () {

                        if (!isDeleteDisabled) {
                            
                            //  No need to notify if the playlist is empty.
                            if (clickedPlaylist.get('items').length === 0) {
                                clickedPlaylist.destroy();
                            } else {

                                var deletePlaylistPromptView = new GenericPromptView({
                                    title: chrome.i18n.getMessage('deletePlaylist'),
                                    okButtonText: chrome.i18n.getMessage('deleteButtonText'),
                                    model: new DeletePlaylistView({
                                        model: clickedPlaylist
                                    })
                                });

                                deletePlaylistPromptView.fadeInAndShow();
                            }

                        }
                    }
                }, {
                    text: chrome.i18n.getMessage("addPlaylistToStream"),
                    disabled: isEmpty,
                    title: isEmpty ? chrome.i18n.getMessage("noAddStreamWarning") : '',
                    onClick: function () {

                        if (!isEmpty) {

                            var streamItems = clickedPlaylist.get('items').map(function (playlistItem) {
                                return {
                                    id: _.uniqueId('streamItem_'),
                                    video: playlistItem.get('video'),
                                    title: playlistItem.get('title')
                                };
                            });

                            StreamItems.addMultiple(streamItems);
                        }

                    }
                }, {
                    text: chrome.i18n.getMessage('edit'),
                    onClick: function () {

                        var editPlaylistPromptView = new GenericPromptView({
                            title: chrome.i18n.getMessage('editPlaylist'),
                            okButtonText: chrome.i18n.getMessage('saveButtonText'),
                            model: new EditPlaylistView({
                                model: clickedPlaylist
                            })
                        });
                        
                        editPlaylistPromptView.fadeInAndShow();

                    }
                }]
            });

        },
        
        selectPlaylist: function (event) {

            var playlistId = $(event.currentTarget).data('playlistid');
            var playlist = this.model.getPlaylistById(playlistId);

            //  If the playlist is already active - do nothing
            if (!playlist.get('active')) {
                //  Deselect the presently active playlist before marking the new one as active.
                var activePlaylist = this.model.getActivePlaylist();
                activePlaylist.set('active', false);
                playlist.set('active', true);
            }
        },
        
        //  TODO: This doesn't seem to be working.
        //  TODO: Needs to be dry with activePlaylistItemsView
        scrollItemIntoView: function (activePlaylist, useAnimation) {

            //  Since we emptied our list we lost the selection, reselect.
            if (activePlaylist) {
                
                var activePlaylistId = activePlaylist.get('id');
                var activeListItem = this.$el.find('li[data-playlistid="' + activePlaylistId + '"]');

                if (activeListItem.length > 0) {
                    activeListItem.scrollIntoView(useAnimation);
                }
            }
            
        },
        
        //  Removes the old 'current' marking and move it to the newly selected row.
        visuallySelectPlaylist: function(playlist) {
            this.scrollItemIntoView(playlist, false);

            this.$el.find('li').removeClass('selected');
            this.$el.find('li[data-playlistid="' + playlist.get('id') + '"]').addClass('selected');
        }

    });

    return ActiveFolderView;
});