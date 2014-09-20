define([
    'background/enum/syncActionType',
    'background/mixin/sequencedCollectionMixin',
    'background/model/chromeNotifications',
    'background/model/playlist',
    'background/model/settings',
    'background/model/song',
    'background/model/tabManager',
    'common/enum/listItemType',
    'common/model/youTubeV3API'
], function (SyncActionType, SequencedCollectionMixin, ChromeNotifications, Playlist, Settings, Song, TabManager, ListItemType, YouTubeV3API) {
    'use strict';

    //  TODO: Stop having this be a singleton so it is easier to test.
    var Playlists = Backbone.Collection.extend(_.extend({}, SequencedCollectionMixin, {
        model: Playlist,
        userId: null,
        
        initialize: function () {
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
        
        setUserId: function(userId) {
            this.userId = userId;
        },
        
        getActivePlaylist: function () {
            return this.findWhere({ active: true });
        },

        //  Expects options: { shortId, urlFriendlyEntityTitle, success, error };
        addPlaylistByShareData: function (options) {
            $.ajax({
                type: 'POST',
                url: Settings.get('serverURL') + 'Playlist/CreateCopyByShareCode',
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
            //  TODO: This reads a bit weird.
            var playlistItems = [];

            if (_.isArray(songs)) {
                playlistItems = _.map(songs, function (song) { return { song: song }; });
            } else {
                playlistItems.push({ song: songs });
            }

            var playlist = new Playlist({
                title: playlistTitle,
                userId: this.userId,
                //  Playlists are always added at the end
                sequence: this.getSequenceFromIndex(this.length),
                items: playlistItems
            });

            //  Save the playlist, but push after version from server because the ID will have changed.
            playlist.save({}, {
                success: function () {
                    //  TODO: It doesn't make sense that I push Playlists after saving but I push PlaylistItems before saving. Probably change this to pushing before, but provide
                    //  a UI indication that the playlist is still being saved.
                    this.push(playlist);
                }.bind(this)
            });
        },

        addPlaylistByDataSource: function (playlistTitle, dataSource) {
            var playlist = new Playlist({
                title: playlistTitle,
                userId: this.userId,
                //  Playlists are always added at the end
                sequence: this.getSequenceFromIndex(this.length),
                dataSource: dataSource,
                dataSourceLoaded: !dataSource.needsLoading()
            });

            //  Save the playlist, but push after version from server because the ID will have changed.
            playlist.save({}, {
                success: function () {
                    //  TODO: It doesn't make sense that I push Playlists after saving but I push PlaylistItems before saving. Probably change this to pushing before, but provide
                    //  a UI indication that the playlist is still being saved.
                    this.push(playlist);

                    if (dataSource.needsLoading()) {
                        playlist.loadDataSource();
                    }
                }.bind(this)
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
                    //  TODO: Reduce nesting
                    YouTubeV3API.getSongInformation({
                        songId: request.songId,
                        success: function (songInformation) {
                            var song = new Song(songInformation);
                            this.get(request.playlistId).get('items').addSongs(song);

                            ChromeNotifications.create({
                                title: chrome.i18n.getMessage('songAdded'),
                                message: song.get('title')
                            });

                            sendResponse({ result: 'success' });
                        }.bind(this),
                        error: function () {
                            ChromeNotifications.create({
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
            //  TODO: This should probably use the same event system as SyncActions.
            //  Notify all open YouTube tabs that a playlist has been added.
            TabManager.messageYouTubeTabs({
                event: SyncActionType.Added, 
                type: ListItemType.Playlist, 
                data: {
                    id: addedPlaylist.get('id'),
                    title: addedPlaylist.get('title')
                }
            });

            this._setCanDelete(true);

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
            
            //  TODO: This should probably use the same event system as SyncActions.
            TabManager.messageYouTubeTabs({
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
            Backbone.Wreqr.radio.channel('sync').vent.trigger('sync', {
                listItemType: ListItemType.Playlist,
                syncActionType: SyncActionType.Added,
                modelId: playlist.get('id'),
                modelAttributes: playlist.getSyncAttributes()
            });
        },
        
        _emitSyncRemoveEvent: function (playlist) {
            //  TODO: Standardize the pattern for emitting triggers via sync.
            Backbone.Wreqr.radio.channel('sync').vent.trigger('sync', {
                listItemType: ListItemType.Playlist,
                syncActionType: SyncActionType.Removed,
                modelId: playlist.get('id')
            });
        },

        //  TODO: Make a custom radio emitter which can give this channel out.
        _getSyncEventChannel: function () {
            return Backbone.Wreqr.radio.channel('sync-' + ListItemType.Playlist).vent;
        }
    }));

    //  Exposed globally so that the foreground can access the same instance through chrome.extension.getBackgroundPage()
    window.Playlists = new Playlists();
    return window.Playlists;
});