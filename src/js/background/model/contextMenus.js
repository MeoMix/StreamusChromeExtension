//  A model which interfaces with the chrome.contextMenus API to generate context menus when clicking on YouTube pages or links.
define([
    'background/notifications',
    'background/collection/streamItems',
    'background/collection/playlists',
    'background/model/user',
    'background/model/song',
    'common/enum/dataSourceType',
    'common/model/youTubeV3API',
    'common/model/utility',
    'common/model/dataSource'
], function (Notifications, StreamItems, Playlists, User, Song, DataSourceType, YouTubeV3API, Utility, DataSource) {
    'use strict';

    var ContextMenu = Backbone.Model.extend({
        
        //  Show the Streamus context menu items only when right-clicking on an appropriate target.
        documentUrlPatterns: ['*://*.youtube.com/watch?*', '*://*.youtu.be/*'],
        targetUrlPatterns: ['*://*.youtube.com/watch?*', '*://*.youtu.be/*'],
        
        initialize: function () {
            this.createContextMenus(['link'], this.targetUrlPatterns, true);
            this.createContextMenus(['page'], this.documentUrlPatterns, false);
            
            chrome.contextMenus.create({
                'contexts': ['selection'],
                //  TODO: i18n
                'title': 'Search for and Play \'%s\'',
                'onclick': function (onClickData) {

                    this.getSongFromText(onClickData.selectionText, function (song) {
                        StreamItems.addSongs(song, {
                            playOnAdd: true
                        });
                    });
                }.bind(this)
            });
        },
        
        createContextMenus: function (contexts, urlPattern, isTarget) {

            var contextMenuOptions = {
                'contexts': contexts,
                'targetUrlPatterns': isTarget ? urlPattern : undefined,
                'documentUrlPatterns': !isTarget ? urlPattern : undefined
            };

            //  Create menu items for specific actions:
            chrome.contextMenus.create(_.extend({}, contextMenuOptions, {
                'title': chrome.i18n.getMessage('play'),
                'onclick': function (onClickData) {
                    var url = onClickData.linkUrl || onClickData.pageUrl;

                    this.getSongFromUrl(url, function (song) {
                        StreamItems.addSongs(song, {
                            playOnAdd: true
                        });
                    });
                }.bind(this)
            }));

            chrome.contextMenus.create(_.extend({}, contextMenuOptions, {
                'title': chrome.i18n.getMessage('add'),
                'onclick': function (onClickData) {
                    var url = onClickData.linkUrl || onClickData.pageUrl;
                    
                    this.getSongFromUrl(url, function (song) {
                        StreamItems.addSongs(song);
                    });
                }.bind(this)
            }));
            
            if (User.get('signedIn')) {
                this.createSaveContextMenu(contextMenuOptions);
            } else {

                this.listenTo(User, 'change:signedIn', function (model, signedIn) {
                    if (signedIn) {
                        this.createSaveContextMenu(contextMenuOptions);
                    }
                });

            }

        },
        
        createSaveContextMenu: function(contextMenuOptions) {
            //  Create a sub menu item to hold all Playlists
            var playlistsContextMenuId = chrome.contextMenus.create(_.extend({}, contextMenuOptions, {
                'title': chrome.i18n.getMessage('save')
            }));

            //  Create menu items for each playlist
            Playlists.each(function (playlist) {
                this.createPlaylistContextMenu(contextMenuOptions, playlistsContextMenuId, playlist);
            }.bind(this));
            
            this.listenTo(Playlists, 'add', function (addedPlaylist) {
                this.createPlaylistContextMenu(contextMenuOptions, playlistsContextMenuId, addedPlaylist);
            });
        },
        
        //  Whenever a playlist context menu is clicked -- add the related song to that playlist.
        createPlaylistContextMenu: function (contextMenuOptions, playlistsContextMenuId, playlist) {

            var playlistContextMenuId = chrome.contextMenus.create(_.extend({}, contextMenuOptions, {
                'title': playlist.get('title'),
                'parentId': playlistsContextMenuId,
                'onclick': function (onClickData) {
                    var url = onClickData.linkUrl || onClickData.pageUrl;

                    this.getSongFromUrl(url, function (song) {
                        playlist.addSongs(song);
                    });
                }.bind(this)
            }));

            //  Update context menu items whenever the playlist's data changes (renamed or deleted)
            this.listenTo(playlist, 'change:title', function () {
                chrome.contextMenus.update(playlistContextMenuId, {
                    'title': playlist.get('title')
                });
            });

            this.listenTo(playlist, 'destroy', function () {
                chrome.contextMenus.remove(playlistContextMenuId);
            });
            
        },
        
        getSongFromText: function(text, callback) {

            YouTubeV3API.getSongInformationByTitle({
                title: text,
                success: function(songInformation) {
                    var song = new Song();
                    song.setYouTubeInformation(songInformation);

                    callback(song);
                }
            });

        },
        
        getSongFromUrl: function(url, callback) {
            var dataSource = new DataSource({ url: url });

            YouTubeV3API.getSongInformation({
                songId: dataSource.get('id'),
                success: function (songInformation) {

                    var song = new Song();
                    song.setYouTubeInformation(songInformation);

                    callback(song);
                },
                error: function() {
                    Notifications.showNotification({
                        title: 'Failed to find song',
                        message: 'An issue was encountered while attempting to find song with URL: ' + url
                    });
                }
            });

        },

    });

    return new ContextMenu();
});