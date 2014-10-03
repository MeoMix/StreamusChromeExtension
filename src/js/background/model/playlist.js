//  Playlist holds a collection of PlaylistItems as well as properties pertaining to a playlist.
//  Provides methods to work with PlaylistItems such as getting, removing, updating, etc..
define([
    'background/collection/playlistItems',
    'background/enum/syncActionType',
    'background/model/playlistItem',
    'background/model/shareCode',
    'background/model/song',
    'background/model/tabManager',
    'common/enum/listItemType',
    'common/model/utility',
    'common/model/youTubeV3API'
], function (PlaylistItems, SyncActionType, PlaylistItem, ShareCode, Song, TabManager, ListItemType, Utility, YouTubeV3API) {
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
                sequence: -1,
                listItemType: ListItemType.Playlist,
                //  Only allowed to delete a playlist if more than 1 exists.
                canDelete: false
            };
        },

        urlRoot: Streamus.serverUrl + 'Playlist/',
            
        //  Convert data which is sent from the server back to a proper Backbone.Model.
        //  Need to recreate submodels as Backbone.Models else they will just be regular Objects.
        parse: function (playlistDto) {
            //  Patch requests do not return information.
            if (!_.isUndefined(playlistDto)) {
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
            }

            return playlistDto;
        },
        
        initialize: function () {
            this._ensureItemsCollection();
            this.on('change:title', this._onChangeTitle);
            this.on('change:sequence', this._onChangeSequence);
            this.listenTo(this.get('items'), 'add reset remove', this._setDisplayInfo);
            this._setDisplayInfo();
        },
        //  TODO: I should be creating a ShareCode object w/ entityID and entityType set and fetching it that way instead.
        getShareCode: function(callback) {
            $.ajax({
                url: Streamus.serverUrl + 'ShareCode/GetShareCode',
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
        
        //  Recursively load any potential bulk data from YouTube after the Playlist has saved successfully.
        loadDataSource: function () {
            YouTubeV3API.getPlaylistSongInformationList({
                playlistId: this.get('dataSource').get('id'),
                success: this._onGetPlaylistSongInformationListSuccess.bind(this)
            });
        },
        
        //  Return the attributes needed to sync this object across chrome.storage.sync
        getSyncAttributes: function () {
            return {
                title: this.get('title'),
                active: this.get('active'),
                sequence: this.get('sequence')
            };
        },
        
        _onGetPlaylistSongInformationListSuccess: function (response) {
            var songs = _.map(response.songInformationList, function (songInformation) {
                return new Song(songInformation);
            });

            //  Periodicially send bursts of packets to the server and trigger visual update.
            this.get('items').addSongs(songs, {
                success: this._onAddSongsByDataSourceSuccess.bind(this, response.nextPageToken)
            });
        },

        _onAddSongsByDataSourceSuccess: function (nextPageToken) {
            if (_.isUndefined(nextPageToken)) {
                this.set('dataSourceLoaded', true);
            }
            else {
                //  Request next batch of data by iteration once addItems has succeeded.
                YouTubeV3API.getPlaylistSongInformationList({
                    playlistId: this.get('dataSource').get('id'),
                    pageToken: nextPageToken,
                    success: this._onGetPlaylistSongInformationListSuccess.bind(this)
                });
            }
        },
        
        _setDisplayInfo: function () {
            var totalItemsDuration = this.get('items').getTotalDuration();
            var prettyTimeWithWords = Utility.prettyPrintTimeWithWords(totalItemsDuration);
            
            var songs = this.get('items').pluck('song');
            var songString = songs.length === 1 ? chrome.i18n.getMessage('song') : chrome.i18n.getMessage('songs');
            
            var displayInfo = songs.length + ' ' + songString + ', ' + prettyTimeWithWords;
            this.set('displayInfo', displayInfo);
        },
        
        _onChangeTitle: function(model, title, options) {
            this._emitYouTubeTabUpdateEvent({
                id: model.get('id'),
                title: title
            });
            
            var fromSyncEvent = options && options.sync;
            if (!fromSyncEvent) {
                this.save({ title: title }, { patch: true });
                this._emitSyncUpdateEvent(model, 'title', title);
            }
        },

        _onChangeSequence: function (model, sequence, options) {
            var fromSyncEvent = options && options.sync;
            if (!fromSyncEvent) {
                this._emitSyncUpdateEvent(model, 'sequence', sequence);
            }
        },
        
        //  TODO: Probably make this look similiar to emitSyncUpdateEvent using radio channels?
        //  Notify all open YouTube tabs that a playlist has been renamed.
        _emitYouTubeTabUpdateEvent: function(data) {
            TabManager.messageYouTubeTabs({
                event: SyncActionType.Updated,
                type: ListItemType.Playlist,
                data: data
            });
        },
        
        _emitSyncUpdateEvent: function (playlist, propertyName, propertyValue) {
            Backbone.Wreqr.radio.channel('sync').vent.trigger('sync', {
                listItemType: ListItemType.Playlist,
                syncActionType: SyncActionType.Updated,
                modelId: playlist.get('id'),
                property: {
                    name: propertyName,
                    value: propertyValue
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
                }), {
                    silent: true
                });
            }
        }
    });

    return Playlist;
});