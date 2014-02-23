//  A model which interfaces with the chrome.contextMenus API to generate context menus when clicking on YouTube pages or links.
define([
    'background/collection/streamItems',
    'background/collection/playlists',
    'background/model/user',
    'background/model/video',
    'common/enum/dataSourceType',
    'common/model/youTubeV2API',
    'common/model/utility',
    'common/model/dataSource'
], function (StreamItems, Playlists, User, Video, DataSourceType, YouTubeV2API, Utility, DataSource) {
    'use strict';

    var ContextMenu = Backbone.Model.extend({
        
        //  Show the Streamus context menu items only when right-clicking on an appropriate target.
        documentUrlPatterns: ['*://*.youtube.com/watch?*', '*://*.youtu.be/*'],
        targetUrlPatterns: ['*://*.youtube.com/watch?*', '*://*.youtu.be/*'],
        
        initialize: function () {
            this.createContextMenus(['link'], this.targetUrlPatterns, true);
            this.createContextMenus(['page'], this.documentUrlPatterns, false);
        },
        
        createContextMenus: function (contexts, urlPattern, isTarget) {

            var contextMenuOptions = {
                'contexts': contexts,
                'targetUrlPatterns': isTarget ? urlPattern : undefined,
                'documentUrlPatterns': !isTarget ? urlPattern : undefined
            };

            //  Create the top-most parent element which says 'Streamus'
            var streamusContextMenuId = chrome.contextMenus.create(_.extend({}, contextMenuOptions, {
                'title': 'Streamus'
            }));

            //  Create sub menu items for specific actions:
            chrome.contextMenus.create(_.extend({}, contextMenuOptions, {
                'title': chrome.i18n.getMessage('play'),
                'parentId': streamusContextMenuId,
                'onclick': function (onClickData) {
                    var url = onClickData.linkUrl || onClickData.pageUrl;
      
                    this.getVideoFromUrl(url, function (video) {
                        StreamItems.addByVideo(video, true);
                    });
                }.bind(this)
            }));

            chrome.contextMenus.create(_.extend({}, contextMenuOptions, {
                'title': chrome.i18n.getMessage('add'),
                'parentId': streamusContextMenuId,
                'onclick': function (onClickData) {
                    var url = onClickData.linkUrl || onClickData.pageUrl;
                    
                    this.getVideoFromUrl(url, function (video) {
                        StreamItems.addByVideo(video, false);
                    });
                }.bind(this)
            }));
            
            if (User.get('signedIn')) {
                this.createSaveContextMenu(streamusContextMenuId, contextMenuOptions);
            } else {

                this.listenTo(User, 'change:signedIn', function (model, signedIn) {
                    if (signedIn) {
                        this.createSaveContextMenu(streamusContextMenuId, contextMenuOptions);
                    }
                });

            }

        },
        
        createSaveContextMenu: function(streamusContextMenuId, contextMenuOptions) {
            //  Create a sub menu item to hold all Playlists
            var playlistsContextMenuId = chrome.contextMenus.create(_.extend({}, contextMenuOptions, {
                'title': chrome.i18n.getMessage('save'),
                'parentId': streamusContextMenuId
            }));

            //  Create menu items for each playlist
            Playlists.each(function (playlist) {
                this.createPlaylistContextMenu(contextMenuOptions, playlistsContextMenuId, playlist);
            }.bind(this));
            
            this.listenTo(Playlists, 'add', function (addedPlaylist) {
                this.createPlaylistContextMenu(contextMenuOptions, playlistsContextMenuId, addedPlaylist);
            });
        },
        
        //  Whenever a playlist context menu is clicked -- add the related video to that playlist.
        createPlaylistContextMenu: function (contextMenuOptions, playlistsContextMenuId, playlist) {

            var playlistContextMenuId = chrome.contextMenus.create(_.extend({}, contextMenuOptions, {
                'title': playlist.get('title'),
                'parentId': playlistsContextMenuId,
                'onclick': function (onClickData) {
                    var url = onClickData.linkUrl || onClickData.pageUrl;

                    this.getVideoFromUrl(url, function (video) {
                        playlist.addByVideo(video);
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
        
        getVideoFromUrl: function(url, callback) {
            var dataSource = new DataSource({ urlToParse: url });
            
            if (dataSource.get('type') !== DataSourceType.YouTubeVideo) {
                throw 'Excepected dataSource to be a YouTube video.';
            }

            YouTubeV2API.getVideoInformation({
                videoId: dataSource.get('sourceId'),
                success: function (videoInformation) {

                    var video = new Video({
                        videoInformation: videoInformation
                    });

                    callback(video);
                },
                error: function (error) {
                    console.error(error);
                }
            });

        },

    });

    return new ContextMenu();
});