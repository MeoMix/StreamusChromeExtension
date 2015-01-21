define(function (require) {
    'use strict';

    var PlaylistItems = require('background/collection/playlistItems');
    var SyncActionType = require('background/enum/syncActionType');
    var ShareCode = require('background/model/shareCode');
    var YouTubeV3API = require('background/model/youTubeV3API');
    var ListItemType = require('common/enum/listItemType');
    
    //  Playlist holds a collection of PlaylistItems as well as properties pertaining to a playlist.
    //  Provides methods to work with PlaylistItems such as getting, removing, updating, etc..
    var Playlist = Backbone.Model.extend({
        defaults: {
            id: null,
            userId: null,
            title: chrome.i18n.getMessage('newPlaylist'),
            //  This is set to a PlaylistItemsCollection once the playlist has an ID.
            items: null,
            dataSource: null,
            dataSourceLoaded: false,
            active: false,
            sequence: -1,
            listItemType: ListItemType.Playlist,
            //  Only allowed to delete a playlist if more than 1 exists.
            canDelete: false
        },

        urlRoot: function() {
            return Streamus.serverUrl + 'Playlist/';
        },
            
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
        },
        
        getShareCode: function(options) {
            $.ajax({
                url: Streamus.serverUrl + 'ShareCode/GetShareCode',
                data: {
                    playlistId: this.get('id')
                },
                success: function (shareCodeJson) {
                    var shareCode = new ShareCode(shareCodeJson);
                    options.success(shareCode);
                },
                error: options.error
            });
        },
        
        //  Recursively load any potential bulk data from YouTube after the Playlist has saved successfully.
        loadDataSource: function () {
            YouTubeV3API.getPlaylistSongs({
                playlistId: this.get('dataSource').get('id'),
                success: this._onGetPlaylistSongsSuccess.bind(this)
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
        
        isLoading: function () {
            return this.has('dataSource') && !this.get('dataSourceLoaded');
        },
        
        _onGetPlaylistSongsSuccess: function (response) {
            //  Periodicially send bursts of packets to the server and trigger visual update.
            this.get('items').addSongs(response.songs, {
                success: this._onAddSongsByDataSourceSuccess.bind(this, response.nextPageToken)
            });
        },

        _onAddSongsByDataSourceSuccess: function (nextPageToken) {
            if (_.isUndefined(nextPageToken)) {
                this.set('dataSourceLoaded', true);
            }
            else {
                //  Request next batch of data by iteration once addItems has succeeded.
                YouTubeV3API.getPlaylistSongs({
                    playlistId: this.get('dataSource').get('id'),
                    pageToken: nextPageToken,
                    success: this._onGetPlaylistSongsSuccess.bind(this)
                });
            }
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
        
        //  Notify all open YouTube tabs that a playlist has been renamed.
        _emitYouTubeTabUpdateEvent: function (data) {
            Streamus.channels.tab.commands.trigger('notify:youTube', {
                event: SyncActionType.Updated,
                type: ListItemType.Playlist,
                data: data
            });
        },
        
        _emitSyncUpdateEvent: function (playlist, propertyName, propertyValue) {
            Streamus.channels.sync.vent.trigger('sync', {
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