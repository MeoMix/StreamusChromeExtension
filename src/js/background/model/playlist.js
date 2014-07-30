//  Playlist holds a collection of PlaylistItems as well as properties pertaining to a playlist.
//  Provides methods to work with PlaylistItems such as getting, removing, updating, etc..
define([
    'background/collection/playlistItems',
    'background/model/playlistItem',
    'background/model/settings',
    'background/model/shareCode',
    'background/model/song',
    'common/model/youTubeV3API'
], function (PlaylistItems, PlaylistItem, Settings, ShareCode, Song, YouTubeV3API) {
    'use strict';

    var Playlist = Backbone.Model.extend({
        defaults: function () {
            return {
                id: null,
                userId: null,
                title: chrome.i18n.getMessage('newPlaylist'),
                //  This is set to a PlaylistItemsCollection once the playlist has an ID.
                items: null,
                dataSource: null,
                dataSourceLoaded: false,
                active: false,
                //  This is count and total duration of all playlistItem songs.
                displayInfo: '',
                sequence: -1
            };
        },

        urlRoot: Settings.get('serverURL') + 'Playlist/',
            
        //  Convert data which is sent from the server back to a proper Backbone.Model.
        //  Need to recreate submodels as Backbone.Models else they will just be regular Objects.
        parse: function (playlistDto) {
            //  Convert C# Guid.Empty into BackboneJS null
            for (var key in playlistDto) {
                if (playlistDto.hasOwnProperty(key) && playlistDto[key] === '00000000-0000-0000-0000-000000000000') {
                    playlistDto[key] = null;
                }
            }
            
            //  Reset will load the server's response into items as a Backbone.Collection
            this.get('items').reset(playlistDto.items);
            this.get('items').playlistId = playlistDto.id;

            // Remove so parse doesn't set and overwrite instance after parse returns.
            delete playlistDto.items;

            return playlistDto;
        },
        
        initialize: function () {
            this._ensureItemsCollection();
            this.on('change:title', this._onChangeTitle);
            this.listenTo(this.get('items'), 'add reset remove', this._setDisplayInfo);
            this._setDisplayInfo();
        },
        
        _setDisplayInfo: function () {
            var songs = this.get('items').pluck('song');
            var songDurations = _.invoke(songs, 'get', 'duration');

            var sumDurations = _.reduce(songDurations, function (memo, duration) {
                return memo + duration;
            }, 0);

            var prettyTime;
            var timeInMinutes = Math.floor(sumDurations / 60);
            
            //  Print the total duration of content in minutes unless there is 3+ hours, then just print hours.
            if (timeInMinutes === 1) {
                prettyTime = timeInMinutes + ' ' + chrome.i18n.getMessage('minute');
            }
            //  3 days
            else if (timeInMinutes > 4320) {
                prettyTime = Math.floor(timeInMinutes / 1440) + ' ' + chrome.i18n.getMessage('days');
            }
            //  3 hours
            else if (timeInMinutes > 180) {
                prettyTime = Math.floor(timeInMinutes / 60) + ' ' + chrome.i18n.getMessage('hours');
            } else {
                prettyTime = timeInMinutes + ' ' + chrome.i18n.getMessage('minutes');
            }
            
            var songString = songs.length === 1 ? chrome.i18n.getMessage('song') : chrome.i18n.getMessage('songs');
            var displayInfo = songs.length + ' ' + songString + ', ' + prettyTime;

            this.set('displayInfo', displayInfo);
        },
            
        getShareCode: function(callback) {
            $.ajax({
                url: Settings.get('serverURL') + 'ShareCode/GetShareCode',
                data: {
                    playlistId: this.get('id')
                },
                success: function (shareCodeJson) {
                    var shareCode = new ShareCode(shareCodeJson);
                    callback(shareCode);
                },
                error: function (error) {
                    console.error("Error retrieving share code", error, error.message);
                }
            });
        },
        
        //  TODO: Reduce nesting
        //  Recursively load any potential bulk data from YouTube after the Playlist has saved successfully.
        loadDataSource: function () {
            YouTubeV3API.getPlaylistSongInformationList({
                playlistId: this.get('dataSource').get('id'),
                success: function onResponse(response) {
                    var songs = _.map(response.songInformationList, function (songInformation) {
                        return new Song(songInformation);
                    });

                    //  Periodicially send bursts of packets to the server and trigger visual update.
                    this.get('items').addSongs(songs, {
                        success: function () {
                            if (_.isUndefined(response.nextPageToken)) {
                                this.set('dataSourceLoaded', true);
                            }
                            else {
                                //  Request next batch of data by iteration once addItems has succeeded.
                                YouTubeV3API.getPlaylistSongInformationList({
                                    playlistId: this.get('dataSource').get('id'),
                                    pageToken: response.nextPageToken,
                                    success: onResponse.bind(this)
                                });
                            }
                        }.bind(this)
                    });
                }.bind(this)
            });
        },
        
        //  TODO: In the future, turn this into a .save({ patch: true } once I figure out how to properly merge updates into the server.
        _onChangeTitle: function(model, title) {
            $.ajax({
                url: Settings.get('serverURL') + 'Playlist/UpdateTitle',
                type: 'PATCH',
                data: {
                    id: model.get('id'),
                    title: title
                }
            });
        },
        
        _ensureItemsCollection: function() {
            var items = this.get('items');

            //  Need to convert items array to Backbone.Collection
            if (!(items instanceof Backbone.Collection)) {
                //  Silent because items is just being properly set.
                this.set('items', new PlaylistItems(items, {
                    playlistId: this.get('id')
                }), { silent: true });
            }
        }
    });

    return Playlist;
});