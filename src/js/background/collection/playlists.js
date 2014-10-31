define([
    'background/enum/syncActionType',
    'background/mixin/collectionSequence',
    'background/model/playlist',
    'background/model/youTubeV3API',
    'common/enum/listItemType'
], function (SyncActionType, CollectionSequence, Playlist, YouTubeV3API, ListItemType) {
    'use strict';

    var Playlists = Backbone.Collection.extend({
        model: Playlist,
        userId: null,
        
        mixins: [CollectionSequence],
        
        initialize: function (models, options) {
            this.userId = options.userId;
            
            chrome.runtime.onMessage.addListener(this._onRuntimeMessage.bind(this));
            this.on('add', this._onAdd);
            this.on('remove', this._onRemove);
            this.on('change:active', this._onChangeActive);
            this.on('reset', this._onReset);

            var syncEventChannel = this._getSyncEventChannel();
            this.listenTo(syncEventChannel, SyncActionType.Added, this._addBySyncAction);
            this.listenTo(syncEventChannel, SyncActionType.Removed, this._removeBySyncAction);
            this.listenTo(syncEventChannel, SyncActionType.Updated, this._updateBySyncAction);
        },
        
        getActivePlaylist: function () {
            return this.findWhere({ active: true });
        },

        //  Expects options: { shortId, urlFriendlyEntityTitle, success, error };
        addPlaylistByShareData: function (options) {
            $.ajax({
                type: 'POST',
                url: Streamus.serverUrl + 'Playlist/CreateCopyByShareCode',
                data: {
                    shortId: options.shortId,
                    urlFriendlyEntityTitle: options.urlFriendlyEntityTitle,
                    userId: this.userId
                },
                success: function (playlistDto) {
                    //  Add and convert back from JSON to Backbone object.
                    var playlist = this.add(playlistDto);
                    options.success(playlist);
                }.bind(this),
                error: options.error
            });
        },
        
        addPlaylistWithSongs: function (playlistTitle, songs) {
            songs = songs instanceof Backbone.Collection ? songs.models : _.isArray(songs) ? songs : [songs];
            var playlistItems = _.map(songs, function (song) {
                return {
                    title: song.get('title'),
                    song: song
                };
            });

            this.create({
                title: playlistTitle,
                userId: this.userId,
                //  Playlists are always added at the end
                sequence: this.getSequenceFromIndex(this.length),
                items: playlistItems
            }, {
                error: function(model) {
                    model.trigger('createError');
                }
            });
        },

        addPlaylistByDataSource: function (playlistTitle, dataSource) {
            this.create({
                title: playlistTitle,
                userId: this.userId,
                //  Playlists are always added at the end
                sequence: this.getSequenceFromIndex(this.length),
                dataSource: dataSource,
                dataSourceLoaded: !dataSource.needsLoading()
            }, {
                success: function (playlist) {
                    if (dataSource.needsLoading()) {
                        playlist.loadDataSource();
                    }
                },
                error: function (model) {
                    model.trigger('createError');
                }
            });
        },
        
        //  TODO: I don't think this should know about syncAction it should just be given the data.
        _addBySyncAction: function (syncAction) {
            var playlistOptions = _.extend({
                id: syncAction.get('modelId'),
                userId: this.userId
            }, syncAction.get('modelAttributes'));

            this.add(playlistOptions, {
                //  Pass a custom sync option to know that the add is occurring from a cross-pc sync 
                sync: true
            });
        },
        
        _removeBySyncAction: function (syncAction) {
            var playlist = this.get(syncAction.get('modelId'));
            this.remove(playlist, {
                //  Pass a custom sync option to know that the add is occurring from a cross-pc sync 
                sync: true
            });
        },
        
        _updateBySyncAction: function(syncAction) {
            var playlist = this.get(syncAction.get('modelId'));

            playlist.set(syncAction.property.name, syncAction.property.value, {
                sync: true
            });
        },
        
        _deactivateAllExcept: function (changedPlaylist) {
            this.each(function (playlist) {
                if (playlist !== changedPlaylist) {
                    playlist.set('active', false);
                }
            });
        },
        
        _setCanDelete: function (canDelete) {
            //  Playlists can only be deleted if there's >1 playlist existing because I don't want to leave the user with 0 playlists.
            this.invoke('set', 'canDelete', canDelete);
        },
        
        _onReset: function() {
            //  Ensure there is an always active playlist by trying to load from localstorage
            if (this.length > 0 && _.isUndefined(this.getActivePlaylist())) {
                var activePlaylistId = localStorage.getItem('activePlaylistId');

                //  Be sure to always have an active playlist if there is one available.
                var playlistToSetActive = this.get(activePlaylistId) || this.at(0);
                playlistToSetActive.set('active', true);
            }

            this._setCanDelete(this.length > 1);
        },
        
        _onRuntimeMessage: function (request, sender, sendResponse) {
            var sendAsynchronousResponse = false;

            switch (request.method) {
                case 'getPlaylists':
                    sendResponse({ playlists: this });
                    break;
                case 'addYouTubeSongByIdToPlaylist':
                    YouTubeV3API.getSong({
                        songId: request.songId,
                        success: function (song) {
                            this.get(request.playlistId).get('items').addSongs(song);

                            Streamus.channels.backgroundNotification.commands.trigger('show:notification', {
                                title: chrome.i18n.getMessage('songAdded'),
                                message: song.get('title')
                            });

                            sendResponse({ result: 'success' });
                        }.bind(this),
                        error: function () {
                            Streamus.channels.backgroundNotification.commands.trigger('show:notification', {
                                title: chrome.i18n.getMessage('errorEncountered')
                            });

                            sendResponse({ result: 'error' });
                        }
                    });

                    sendAsynchronousResponse = true;
                    break;
            }

            //  sendResponse becomes invalid when the event listener returns, unless you return true from the event listener to indicate you wish to send a response asynchronously (this will keep the message channel open to the other end until sendResponse is called).
            return sendAsynchronousResponse;
        },
        
        _onChangeActive: function (changedPlaylist, active) {
            //  Ensure only one playlist is active at a time by de-activating all other active playlists.
            if (active) {
                this._deactivateAllExcept(changedPlaylist);
                localStorage.setItem('activePlaylistId', changedPlaylist.get('id'));
            }
        },
        
        _onAdd: function (addedPlaylist, collection, options) {
            //  Add events fire before the playlist is successfully saved to the server so that the UI can show a saving indicator.
            //  This means that addedPlaylist's ID might not be set yet. If that's the case, wait until successful save before relying on it.
            if (addedPlaylist.isNew()) {
                this.listenToOnce(addedPlaylist, 'createError', function () {
                    //  TODO: Do something with this error.
                    this.stopListening(addedPlaylist, 'change:id');
                });

                this.listenToOnce(addedPlaylist, 'change:id', function () {
                    this.stopListening(addedPlaylist, 'createError');
                    this._onCreateSuccess(addedPlaylist, options);
                });
            } else {
                this._onCreateSuccess(addedPlaylist, options);
            }
        },
        
        _onCreateSuccess: function (addedPlaylist, options) {
            //  Notify all open YouTube tabs that a playlist has been added.
            Streamus.channels.tab.commands.trigger('notify:youTube', {
                event: SyncActionType.Added,
                type: ListItemType.Playlist,
                data: {
                    id: addedPlaylist.get('id'),
                    title: addedPlaylist.get('title')
                }
            });

            this._setCanDelete(this.length > 1);

            var fromSyncEvent = options && options.sync;
            if (!fromSyncEvent) {
                this._emitSyncAddEvent(addedPlaylist);
            }
        },
        
        //  Whenever a playlist is removed, if it was selected, select the next playlist.
        _onRemove: function (removedPlaylist, collection, options) {
            if (removedPlaylist.get('active')) {
                //  Clear local storage of the active playlist if it gets removed.
                localStorage.setItem('activePlaylistId', null);
                //  If the index of the item removed was the last one in the list, activate previous.
                var index = options.index === this.length ? options.index - 1 : options.index;
                this._activateByIndex(index);
            }
            
            if (this.length === 1) {
                this._setCanDelete(false);
            }
            
            //  Notify all open YouTube tabs that a playlist has been added.
            Streamus.channels.tab.commands.trigger('notify:youTube', {
                event: SyncActionType.Removed,
                type: ListItemType.Playlist,
                data: {
                    id: removedPlaylist.get('id')
                }
            });
            
            var fromSyncEvent = options && options.sync;
            if (!fromSyncEvent) {
                this._emitSyncRemoveEvent(removedPlaylist);
            }
        },
        
        _activateByIndex: function (index) {
            this.at(index).set('active', true);
        },
        
        _emitSyncAddEvent: function (playlist) {
            //  TODO: Standardize the pattern for emitting triggers via sync.
            Streamus.channels.sync.vent.trigger('sync', {
                listItemType: ListItemType.Playlist,
                syncActionType: SyncActionType.Added,
                modelId: playlist.get('id'),
                modelAttributes: playlist.getSyncAttributes()
            });
        },
        
        _emitSyncRemoveEvent: function (playlist) {
            //  TODO: Standardize the pattern for emitting triggers via sync.
            Streamus.channels.sync.vent.trigger('sync', {
                listItemType: ListItemType.Playlist,
                syncActionType: SyncActionType.Removed,
                modelId: playlist.get('id')
            });
        },

        //  TODO: Make a custom radio emitter which can give this channel out.
        _getSyncEventChannel: function () {
            //  TODO: Uhhhh this seems bad.
            return Backbone.Wreqr.radio.channel('sync-' + ListItemType.Playlist).vent;
        }
    });

    return Playlists;
});