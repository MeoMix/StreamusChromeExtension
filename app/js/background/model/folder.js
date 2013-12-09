//  A folder is a collection of playlists
define([
    'playlists',
    'playlist',
    'video',
    'player',
    'settings',
    'youTubeV2API',
    'youTubeV3API',
    'dataSource',
    'dataSourceType'
], function (Playlists, Playlist, Video, Player, Settings, YouTubeV2API, YouTubeV3API, DataSource, DataSourceType) {
    'use strict';
    
    var Folder = Backbone.Model.extend({
        defaults: function () {
            return {
                id: null,
                title: '',
                playlists: new Playlists(),
                //  This is pulled from localStorage and not tracked server-side.
                active: false
            };
        },
        urlRoot: Settings.get('serverURL') + 'Video/',
        
        parse: function (folderDto) {
            
            //  Convert C# Guid.Empty into BackboneJS null
            for (var key in folderDto) {
                if (folderDto.hasOwnProperty(key) && folderDto[key] == '00000000-0000-0000-0000-000000000000') {
                    folderDto[key] = null;
                }
            }

            return folderDto;
        },

        initialize: function () {
            var playlists = this.get('playlists');

            //  Need to convert playlists array to Backbone.Collection
            if (!(playlists instanceof Backbone.Collection)) {
                playlists = new Playlists(playlists);
                //  Silent because playlists is just being properly set.
                this.set('playlists', playlists, { silent: true });
            }

            //  If folder has an id then try to load active playlist from localstorage
            if (!this.isNew() && playlists.length > 0) {

                var activePlaylistId = localStorage.getItem(this.get('id') + '_activePlaylistId');

                //  Be sure to always have an active playlist if there is one available.
                var playlistToSetActive = this.getPlaylistById(activePlaylistId) || playlists.at(0);
                playlistToSetActive.set('active', true);

            }

            //  Cleanup local storage whenever folder is removed.
            this.on('destroy', function () {
                localStorage.removeItem(self.get('id') + '_activePlaylistId');
            });

            this.listenTo(playlists, 'sync', function() {
                this.trigger('sync');
            });

            this.listenTo(playlists, 'change:active', function (playlist, isActive) {
                //  Keep local storage up-to-date with the active playlist.
                if (isActive) {
                    localStorage.setItem(self.get('id') + '_activePlaylistId', playlist.get('id'));
                }

            });

            this.listenTo(playlists, 'remove', function (removedPlaylist) {
                //  Clear local storage of the active playlist if it gets removed.
                if (removedPlaylist.get('active')) {
                    localStorage.setItem(this.get('id') + '_activePlaylistId', null);
                }

            });

            this.listenTo(this.get('playlists'), 'add', function(playlist) {
            
                //  Notify all open YouTube tabs that a playlist has been added to a folder.
                sendEventToOpenYouTubeTabs('add', 'playlist', {
                    id: playlist.get('id'),
                    title: playlist.get('title')
                });
            
            });

            this.listenTo(this.get('playlists'), 'remove', function (playlist) {

                //  Notify all open YouTube tabs that a playlist has been removed from a folder.
                sendEventToOpenYouTubeTabs('remove', 'playlist', {
                    id: playlist.get('id'),
                    title: playlist.get('title')
                });

            });

            this.listenTo(this.get('playlists'), 'change:title', function (playlist) {

                //  Notify all open YouTube tabs that a playlist has been renamed.
                sendEventToOpenYouTubeTabs('rename', 'playlist', {
                    id: playlist.get('id'),
                    title: playlist.get('title')
                });

            });

        },
        
        addVideoByIdToPlaylist: function (id, playlistId) {
            this.get('playlists').get(playlistId).addVideoByIdToPlaylist(id);
        },
        
        addPlaylistByInformation: function(playlistTitle, videoInformation) {

            //  Support adding just a single videoInformation object or an entire array.
            if (_.isArray(videoInformation)) {
                var videos = _.map(videoInformation, function (videoInformation) {
                    return new Video({
                        videoInformation: videoInformation
                    });
                });

                this.addPlaylistWithVideos(playlistTitle, videos);
            } else {
                var video = new Video({
                    videoInformation: videoInformation
                });

                this.addPlaylistWithVideos(playlistTitle, video);
            }

        },
        
        addPlaylistWithVideos: function(playlistTitle, videos) {
            var self = this;

            var playlistItems = [];
            
            if (_.isArray(videos)) {
                playlistItems = _.map(videos, function(video) { return { video: video }; });
            } else {
                playlistItems.push({ video: videos });
            }
            
            var playlist = new Playlist({
                title: playlistTitle,
                folderId: this.get('id'),
                items: playlistItems
            });

            //  Save the playlist, but push after version from server because the ID will have changed.
            playlist.save({}, {
                success: function() {            
                    self.get('playlists').push(playlist);
                }
            });
        },
        
        addPlaylistByShareData: function (shareCodeShortId, urlFriendlyEntityTitle, callback) {
            var self = this;

            $.ajax({
                url: Settings.get('serverURL') + 'Playlist/CreateCopyByShareCode',
                dataType: 'json',
                data: {
                    shareCodeShortId: shareCodeShortId,
                    urlFriendlyEntityTitle: urlFriendlyEntityTitle,
                    folderId: self.get('id')
                },
                success: function (playlistCopy) {
                    //  Convert back from JSON to a backbone object.
                    playlistCopy = new Playlist(playlistCopy);

                    self.get('playlists').push(playlistCopy);

                    callback(playlistCopy);
                    self.trigger('sync');
                },
                error: function (error) {
                    console.error("Error adding playlist by share data", error);
                    callback();
                }
            });

        },
        
        addEmptyPlaylist: function (playlistTitle) {
            this.addPlaylistByDataSource(playlistTitle, new DataSource());
        },

        addPlaylistByDataSource: function (playlistTitle, dataSource) {
            var self = this;

            var playlist = new Playlist({
                title: playlistTitle,
                folderId: this.get('id'),
                dataSource: dataSource,
                dataSourceLoaded: !dataSource.needsLoading()
            });

            //  Save the playlist, but push after version from server because the ID will have changed.
            playlist.save({}, {
                success: function () {

                    self.get('playlists').push(playlist);

                    if (dataSource.needsLoading()) {

                        console.log("needs loading");
                        
                        if (dataSource.isV3()) {
                            //  TODO: Finish implementing this.
                            YouTubeV3API.getDataSourceResults(dataSource, function onGetV3DataSourceData(response) {

                            });
                        } else {
                            console.log("v2");
                            //  Recursively load any potential bulk data from YouTube after the Playlist has saved successfully.
                            YouTubeV2API.getDataSourceResults(dataSource, 0, function onGetV2DataSourceData(response) {
                                console.log("Response:", response);
                                if (response.results.length === 0) {
                                    playlist.set('dataSourceLoaded', true);
                                } else {

                                    //  Turn videoInformation responses into a Video collection.
                                    var videos = _.map(response.results, function (videoInformation) {

                                        return new Video({
                                            videoInformation: videoInformation
                                        });

                                    });

                                    //  Periodicially send bursts of packets to the server and trigger visual update.
                                    playlist.addByVideos(videos, function () {

                                        //  Request next batch of data by iteration once addItems has succeeded.
                                        YouTubeV2API.getDataSourceResults(dataSource, ++response.iteration, onGetV2DataSourceData);

                                    });

                                }
                            });
                            
                        }
   
                    }
                    
                },
                error: function (error) {
                    console.error(error);
                }
            });

        },
        
        removePlaylistById: function(playlistId) {

            var playlist = this.get('playlists').get(playlistId);
  
            playlist.destroy({
                success: function () {
                    //  Remove from playlists clientside only after server responds with successful delete.
                    playlists.remove(playlist);
                },
                error: function (error) {
                    console.error(error);
                }
            });
        },

        getActivePlaylist: function(){
            return this.get('playlists').findWhere({ active: true });
        },

        getPlaylistById: function (playlistId) {
            return this.get('playlists').findWhere({ id: playlistId });
        }
    });


    function sendEventToOpenYouTubeTabs(event, type, data) {

        chrome.tabs.query({ url: '*://*.youtube.com/watch?v*' }, function (tabs) {

            _.each(tabs, function (tab) {
                chrome.tabs.sendMessage(tab.id, {
                    event: event,
                    type: type,
                    data: data
                });
            });

        });

    }
    
    return Folder;
});