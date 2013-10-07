//  This is the list of playlists on the playlists tab.
define([
    'contextMenuView',
    'utility',
    'dataSource',
    'streamItems',
    'playlistView',
    'loadingSpinnerView'
], function (ContextMenuView, Utility, DataSource, StreamItems, PlaylistView, LoadingSpinnerView) {
    'use strict';

    var ActiveFolderView = Backbone.View.extend({
        
        tagName: 'ul',

        template: _.template($('#activeFolderTemplate').html()),

        loadingSpinnerView: new LoadingSpinnerView,
        
        events: {
            'contextmenu': 'showContextMenu',
            'contextmenu li': 'showItemContextMenu',
            'click ul li': 'selectPlaylist'
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

                var firstPlaylistId = activeFolder.get('firstPlaylistId');
                var playlist = activeFolder.get('playlists').get(firstPlaylistId);

                //  Build up the ul of li's representing each playlist.
                var listItems = [];
                do {

                    var playlistView = new PlaylistView({
                        model: playlist
                    });

                    var element = playlistView.render().el;
                    listItems.push(element);

                    var nextPlaylistId = playlist.get('nextPlaylistId');
                    playlist = activeFolder.get('playlists').get(nextPlaylistId);

                } while (playlist.get('id') !== firstPlaylistId)
                
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

            if (this.$el.find('li').length > 0) {

                var previousPlaylistId = playlist.get('previousPlaylistId');
                var previousPlaylistLi = this.$el.find('li[data-playlistid="' + previousPlaylistId + '"]');
                element.insertAfter(previousPlaylistLi);

            } else {
                element.appendTo(this.$el);
            }

            if (playlist.has('dataSource')) {

                var dataSourceType = playlist.get('dataSource').type;

                if (dataSourceType === DataSource.YOUTUBE_PLAYLIST || dataSourceType === DataSource.YOUTUBE_CHANNEL || dataSourceType === DataSource.YOUTUBE_FAVORITES) {

                    if (!playlist.get('dataSourceLoaded')) {

                        var playlistLi = this.$el.find('li[data-playlistid="' + playlist.get('id') + '"]');
                        playlistLi.append(this.loadingSpinnerView.render().el);

                        var self = this;
                        playlist.once('change:dataSourceLoaded', function () {
                            self.loadingSpinnerView.remove();
                        });

                    }

                }
            }

            //this.emptyNotification.hide();
            this.scrollItemIntoView(playlist, true);
        },
        
        //  TODO: Folder otpions.
        showContextMenu: function(event) {
            
        },
        
        showItemContextMenu: function (event) {
            
            var clickedPlaylistId = $(event.currentTarget).data('playlistid');
            var clickedPlaylist = this.model.get('playlists').get(clickedPlaylistId);

            //  Don't allow deleting of the last playlist in a folder ( at least for now )
            var isDeleteDisabled = clickedPlaylist.get('nextPlaylistId') === clickedPlaylist.get('id');
            var isAddPlaylistDisabled = clickedPlaylist.get('items').length === 0;

            ContextMenuView.addGroup({
                position: 0,
                items: [{
                    position: 0,
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
                    position: 1,
                    text: chrome.i18n.getMessage("delete"),
                    disabled: isDeleteDisabled,
                    title: isDeleteDisabled ? chrome.i18n.getMessage("lastPlaylistNoDeleteWarning") : '',
                    onClick: function () {

                        if (!isDeleteDisabled) {
                            clickedPlaylist.destroy();
                        }
                    }
                }, {
                    position: 2,
                    text: chrome.i18n.getMessage("addPlaylistToStream"),
                    disabled: isAddPlaylistDisabled,
                    title: isAddPlaylistDisabled ? chrome.i18n.getMessage("addPlaylistNoAddStreamWarning") : '',
                    onClick: function () {

                        if (!isAddPlaylistDisabled) {

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
                }]
            });

            ContextMenuView.show({
                top: event.pageY,
                left: event.pageX + 1
            });

            return false;
        },
        
        selectPlaylist: function (event) {

            console.log("Selecting playlist");

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