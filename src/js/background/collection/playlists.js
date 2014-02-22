define([
    'background/mixin/sequencedCollectionMixin',
    'background/model/playlist',
    'background/model/video',
    'common/model/youTubeV2API',
    'common/model/dataSource'
], function (SequencedCollectionMixin, Playlist, Video, YouTubeV2API, DataSource) {
    'use strict';

    //  If the foreground requests, don't instantiate -- return existing from the background.
    if (!_.isUndefined(chrome.extension.getBackgroundPage().window.Playlists)) {
        return chrome.extension.getBackgroundPage().window.Playlists;
    }

    var Playlists = Backbone.Collection.extend({
        model: Playlist,
        comparator: 'sequence',
        userId: null,

        initialize: function () {

            //  Ensure there is an always active playlist by trying to load from localstorage
            if (this.length > 0 && _.isUndefined(this.getActivePlaylist())) {
                var activePlaylistId = localStorage.getItem('activePlaylistId');

                //  Be sure to always have an active playlist if there is one available.
                var playlistToSetActive = this.get(activePlaylistId) || playlists.at(0);
                playlistToSetActive.set('active', true);
            }

            chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {

                switch (request.method) {
                    case 'getPlaylists':
                        sendResponse({ playlists: this });
                        break;
                    case 'addVideoByIdToPlaylist':

                        YouTubeV2API.getVideoInformation({
                            videoId: request.videoId,
                            success: function (videoInformation) {
                                var video = new Video({
                                    videoInformation: videoInformation
                                });
                                
                                this.get(request.playlistId).addByVideo(video);

                                sendResponse({ result: 'success' });
                            }.bind(this),
                            error: function () {
                                sendResponse({ result: 'error' });
                            }
                        });
                        break;
                }
            }.bind(this));

            this.on('add', function (addedPlaylist) {
                
                //  TODO: This could potentially be costly if not debounced.
                //  Notify all open YouTube tabs that a playlist has been added.
                sendEventToOpenYouTubeTabs('add', 'playlist', {
                    id: addedPlaylist.get('id'),
                    title: addedPlaylist.get('title')
                });
            });

            //  Whenever a playlist is removed, if it was selected, select the next playlist.
            this.on('remove', function (removedPlaylist, collection, options) {

                if (removedPlaylist.get('active')) {
                    //  Clear local storage of the active playlist if it gets removed.
                    localStorage.setItem('activePlaylistId', null);
                    
                    //  Try selecting the next playlist if its there...
                    var nextPlaylist = this.at(options.index);

                    if (nextPlaylist !== undefined) {
                        nextPlaylist.set('active', true);
                    } else {
                        //  Otherwise select the previous playlist.
                        var previousPlaylist = this.at(options.index - 1);
                        previousPlaylist.set('active', true);
                    }
                }

                //  TODO: This could potentially be costly if not debounced.
                //  Notify all open YouTube tabs that a playlist has been removed.
                sendEventToOpenYouTubeTabs('remove', 'playlist', {
                    id: removedPlaylist.get('id'),
                    title: removedPlaylist.get('title')
                });

            });
            
            this.on('change:active', function (changedPlaylist, active) {
                //  Ensure only one playlist is selected at a time by de-selecting all other selected playlists.
                if (active) {
                    this.deselectAllExcept(changedPlaylist);
                    localStorage.setItem('activePlaylistId', changedPlaylist.get('id'));
                }
            });

            this.on('change:title', function(changedPlaylist, title) {
                //  Notify all open YouTube tabs that a playlist has been renamed.
                sendEventToOpenYouTubeTabs('rename', 'playlist', {
                    id: changedPlaylist.get('id'),
                    title: title
                });
            });
        },
        
        setUserId: function(userId) {
            this.userId = userId;
        },
        
        //  Disallow the deletion of the last playlist.
        canDelete: function () {
            return this.length > 1;
        },
        
        getActivePlaylist: function() {
            return this.findWhere({ active: true });
        },
        
        deselectAllExcept: function (changedPlaylist) {

            this.each(function (playlist) {
                if (playlist !== changedPlaylist) {
                    playlist.set('active', false);
                }
            });
            
        },
        
        addPlaylistWithVideos: function (playlistTitle, videos) {
            var playlistItems = [];

            if (_.isArray(videos)) {
                playlistItems = _.map(videos, function (video) { return { video: video }; });
            } else {
                playlistItems.push({ video: videos });
            }

            var playlist = new Playlist({
                title: playlistTitle,
                userId: this.userId,
                items: playlistItems
            });

            //  Save the playlist, but push after version from server because the ID will have changed.
            playlist.save({}, {
                success: function () {
                    this.push(playlist);
                }.bind(this)
            });
        },

        addEmptyPlaylist: function (playlistTitle) {
            this.addPlaylistByDataSource(playlistTitle, new DataSource());
        },

        addPlaylistByDataSource: function (playlistTitle, dataSource) {
            var self = this;

            console.log("user id:", this.userId);

            var playlist = new Playlist({
                title: playlistTitle,
                userId: this.userId,
                dataSource: dataSource,
                dataSourceLoaded: !dataSource.needsLoading()
            });

            //  Save the playlist, but push after version from server because the ID will have changed.
            playlist.save({}, {
                success: function () {
                    self.push(playlist);
     
                    if (dataSource.needsLoading()) {

                        if (dataSource.isV3()) {
                            //  TODO: Finish implementing this.
                            //YouTubeV3API.getDataSourceResults(dataSource, function onGetV3DataSourceData(response) {

                            //});
                        } else {

                            //  Recursively load any potential bulk data from YouTube after the Playlist has saved successfully.
                            YouTubeV2API.getDataSourceResults(dataSource, 0, function onGetV2DataSourceData(response) {

                                if (response.results.length === 0) {
                                    playlist.set('dataSourceLoaded', true);
                                } else {

                                    //  Turn videoInformation responses into a Video collection.
                                    var videos = _.map(response.results, function (videoInformation) {
                                        return new Video({ videoInformation: videoInformation });
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

        }
        
    });
    
    //  Mixin methods needed for sequenced collections
    _.extend(Playlists.prototype, SequencedCollectionMixin);

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

    //  Exposed globally so that the foreground can access the same instance through chrome.extension.getBackgroundPage()
    window.Playlists = new Playlists();
    return window.Playlists;
});