define(function(require) {
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
            title: '',
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
            
        //  Convert data which is sent from the server back to a proper Backbone.Model.
        //  Need to recreate submodels as Backbone.Models else they will just be regular Objects.
        parse: function(playlistDto) {
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

        initialize: function() {
            this._ensureItemsCollection();
            this._setActivePlaylistListeners(this.get('active'));

            this.on('change:title', this._onChangeTitle);
            this.on('change:active', this._onChangeActive);
        },

        getShareCode: function(options) {
            $.ajax({
                url: Streamus.serverUrl + 'ShareCode/GetShareCode',
                data: {
                    playlistId: this.get('id')
                },
                success: function(shareCodeJson) {
                    var shareCode = new ShareCode(shareCodeJson);
                    options.success(shareCode);
                },
                error: options.error
            });
        },
        
        //  Recursively load any potential bulk data from YouTube after the Playlist has saved successfully.
        loadDataSource: function() {
            YouTubeV3API.getPlaylistSongs({
                playlistId: this.get('dataSource').get('entityId'),
                success: this._onGetPlaylistSongsSuccess.bind(this)
            });
        },

        isLoading: function() {
            return this.has('dataSource') && !this.get('dataSourceLoaded');
        },

        _onGetPlaylistSongsSuccess: function(response) {
            //  Periodicially send bursts of packets to the server and trigger visual update.
            this.get('items').addSongs(response.songs, {
                success: this._onAddSongsByDataSourceSuccess.bind(this, response.nextPageToken)
            });
        },

        _onAddSongsByDataSourceSuccess: function(nextPageToken) {
            if (_.isUndefined(nextPageToken)) {
                this.set('dataSourceLoaded', true);
            } else {
                //  Request next batch of data by iteration once addItems has succeeded.
                YouTubeV3API.getPlaylistSongs({
                    playlistId: this.get('dataSource').get('entityId'),
                    pageToken: nextPageToken,
                    success: this._onGetPlaylistSongsSuccess.bind(this)
                });
            }
        },

        _onChangeTitle: function(model, title) {
            this._emitYouTubeTabUpdateEvent({
                id: model.get('id'),
                title: title
            });

            this.save({ title: title }, { patch: true });
        },

        _onChangeActive: function(model, active) {
            this._setActivePlaylistListeners(active);

            this._emitYouTubeTabUpdateEvent({
                id: model.get('id'),
                active: active
            });

            if (!active) {
                this.get('items').deselectAll();
            }
        },
        
        //  Notify all open YouTube tabs that a playlist has been renamed.
        _emitYouTubeTabUpdateEvent: function(data) {
            Streamus.channels.tab.commands.trigger('notify:youTube', {
                event: SyncActionType.Updated,
                type: ListItemType.Playlist,
                data: data
            });
        },

        _setActivePlaylistListeners: function(active) {
            if (active) {
                this.listenTo(Streamus.channels.activePlaylist.commands, 'save:song', this._saveSong);
            } else {
                this.stopListening(Streamus.channels.activePlaylist.commands);
            }
        },

        _saveSong: function(song) {
            var duplicatesInfo = this.get('items').getDuplicatesInfo(song);

            if (duplicatesInfo.allDuplicates) {
                Streamus.channels.backgroundNotification.commands.trigger('show:notification', {
                    title: duplicatesInfo.message
                });
            } else {
                this.get('items').addSongs(song, {
                    success: this._onSaveSongsSuccess.bind(this, song),
                    error: this._onSaveSongsError.bind(this)
                });
            }
        },

        _onSaveSongsSuccess: function(savedSong) {
            Streamus.channels.backgroundNotification.commands.trigger('show:notification', {
                title: chrome.i18n.getMessage('songSavedToPlaylist', [savedSong.get('title'), this.get('title')])
            });
        },

        _onSaveSongsError: function() {
            Streamus.channels.backgroundNotification.commands.trigger('show:notification', {
                title: chrome.i18n.getMessage('errorEncountered')
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