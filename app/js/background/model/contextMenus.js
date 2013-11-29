//  A model which interfaces with the chrome.contextMenus API to generate context menus when clicking on YouTube pages or links.
define([
    'streamItems',
    'video',
    'youTubeV2API',
    'utility',
    'folders',
    'user',
    'dataSource',
    'dataSourceType'
], function (StreamItems, Video, YouTubeV2API, Utility, Folders, User, DataSource, DataSourceType) {
    'use strict';

    var ContextMenu = Backbone.Model.extend({
        //  Show the Streamus context menu items only when right-clicking on an appropriate target.
        documentUrlPatterns: ["*://*.youtube.com/watch?*", "*://*.youtu.be/*"],
        targetUrlPatterns: ["*://*.youtube.com/watch?*", "*://*.youtu.be/*"],
        
        initialize: function () {

            if (User.get('loaded')) {
                this.createContextMenus(["link"], this.targetUrlPatterns, true);
                this.createContextMenus(["page"], this.documentUrlPatterns, false);
            } else {
                this.listenToOnce(User, 'change:loaded', function() {
                    this.createContextMenus(["link"], this.targetUrlPatterns, true);
                    this.createContextMenus(["page"], this.documentUrlPatterns, false);
                });
            }

        },
        
        createContextMenus: function (contexts, urlPattern, isTarget) {
            var self = this;

            var contextMenuOptions = {
                "contexts": contexts,
                "targetUrlPatterns": isTarget ? urlPattern : undefined,
                "documentUrlPatterns": !isTarget ? urlPattern : undefined
            };

            //  Create the top-most parent element which says "Streamus"
            var streamusContextMenuId = chrome.contextMenus.create(_.extend({}, contextMenuOptions, {
                "title": "Streamus"
            }));

            //  Create sub menu items for specific actions:
            chrome.contextMenus.create(_.extend({}, contextMenuOptions, {
                "title": chrome.i18n.getMessage('play'),
                "parentId": streamusContextMenuId,
                "onclick": function (onClickData) {

                    var url = onClickData.linkUrl || onClickData.pageUrl;
      
                    self.getVideoFromUrl(url, function (video) {

                        StreamItems.addByVideo(video, true);
                        
                    });
        
                }
            }));

            chrome.contextMenus.create(_.extend({}, contextMenuOptions, {
                "title": chrome.i18n.getMessage('addToStream'),
                "parentId": streamusContextMenuId,
                "onclick": function (onClickData) {

                    var url = onClickData.linkUrl || onClickData.pageUrl;
                    
                    self.getVideoFromUrl(url, function (video) {

                        StreamItems.add({
                            id: _.uniqueId('streamItem_'),
                            video: video,
                            title: video.get('title')
                        });

                    });

                }
            }));
            
            //  Create a sub menu item to hold all Playlists

            var playlistsContextMenuId = chrome.contextMenus.create(_.extend({}, contextMenuOptions, {
                "title": chrome.i18n.getMessage('addToPlaylist'),
                "parentId": streamusContextMenuId
            }));

            var playlists = Folders.getActiveFolder().get('playlists');

            //  Create menu items for each playlist
            playlists.each(function (playlist) {
                self.createPlaylistContextMenu(contextMenuOptions, playlistsContextMenuId, playlist);
            });

            this.listenTo(playlists, 'add', function (addedPlaylist) {
                this.createPlaylistContextMenu(contextMenuOptions, playlistsContextMenuId, addedPlaylist);
            });
        },
        
        //  Whenever a playlist context menu is clicked -- add the related video to that playlist.
        createPlaylistContextMenu: function (contextMenuOptions, playlistsContextMenuId, playlist) {
            var self = this;
            
            var playlistContextMenuId = chrome.contextMenus.create(_.extend({}, contextMenuOptions, {
                "title": playlist.get('title'),
                "parentId": playlistsContextMenuId,
                "onclick": function (onClickData) {
                    var url = onClickData.linkUrl || onClickData.pageUrl;

                    self.getVideoFromUrl(url, function (video) {
                        playlist.addByVideo(video);
                    });
                }
            }));

            //  Update context menu items whenever the playlist's data changes (renamed or deleted)
            this.listenTo(playlist, 'change:title', function () {
                chrome.contextMenus.update(playlistContextMenuId, {
                    "title": playlist.get('title')
                });
            });

            this.listenTo(playlist, 'destroy', function () {
                chrome.contextMenus.remove(playlistContextMenuId);
            });
            
        },
        
        getVideoFromUrl: function(url, callback) {
            var dataSource = new DataSource({ urlToParse: url });
            
            if (dataSource.get('type') !== DataSourceType.YOUTUBE_VIDEO) {
                throw "Excepected dataSource to be a YouTube video.";
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