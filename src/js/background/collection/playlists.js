define(function(require) {
    'use strict';

    var SyncActionType = require('background/enum/syncActionType');
    var CollectionSequence = require('background/mixin/collectionSequence');
    var Playlist = require('background/model/playlist');
    var YouTubeV3API = require('background/model/youTubeV3API');
    var ListItemType = require('common/enum/listItemType');
    var DataSource = require('background/model/dataSource');

    var Playlists = Backbone.Collection.extend({
        model: Playlist,
        userId: null,

        mixins: [CollectionSequence],

        url: function() {
            return Streamus.serverUrl + 'Playlist/';
        },

        initialize: function(models, options) {
            this.userId = options.userId;

            chrome.runtime.onMessage.addListener(this._onChromeRuntimeMessage.bind(this));
            this.on('add', this._onAdd);
            this.on('remove', this._onRemove);
            this.on('change:active', this._onChangeActive);
            this.on('reset', this._onReset);
        },

        getActivePlaylist: function() {
            return this.findWhere({ active: true });
        },

        //  Expects options: { playlistId, success, error };
        copyPlaylist: function(options) {
            $.ajax({
                type: 'POST',
                url: Streamus.serverUrl + 'Playlist/Copy',
                data: {
                    playlistId: options.playlistId,
                    userId: this.userId
                },
                success: function(playlistDto) {
                    //  Add and convert back from JSON to Backbone object.
                    var playlist = this.add(playlistDto);
                    playlist.set('active', true);
                    options.success(playlist);
                }.bind(this),
                error: options.error
            });
        },

        addPlaylistWithSongs: function(playlistTitle, songs) {
            songs = songs instanceof Backbone.Collection ? songs.models : _.isArray(songs) ? songs : [songs];
            var playlistItems = _.map(songs, function(song) {
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
                success: function(playlist) {
                    //  It's important to call set instead of providing value in create in order to de-activate other active playlist.
                    playlist.set('active', true);
                },
                error: function(model) {
                    model.trigger('createError');
                }
            });
        },

        addPlaylistByDataSource: function(playlistTitle, dataSource) {
            this.create({
                title: playlistTitle,
                userId: this.userId,
                //  Playlists are always added at the end
                sequence: this.getSequenceFromIndex(this.length),
                dataSource: dataSource,
                //  If a playlist is being created with a YouTube Playlist URL then that URL will need to be imported into the playlist.
                dataSourceLoaded: !dataSource.isYouTubePlaylist()
            }, {
                success: function(playlist) {
                    //  It's important to call set instead of providing value in create in order to de-activate other active playlist.
                    playlist.set('active', true);

                    if (!playlist.get('dataSourceLoaded')) {
                        playlist.loadDataSource();
                    }
                },
                error: function(model) {
                    model.trigger('createError');
                }
            });
        },

        _deactivateAllExcept: function(changedPlaylist) {
            this.each(function(playlist) {
                if (playlist !== changedPlaylist) {
                    playlist.set('active', false);
                }
            });
        },

        _setCanDelete: function(canDelete) {
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

        _onChromeRuntimeMessage: function(request, sender, sendResponse) {
            var sendAsynchronousResponse = false;

            switch (request.method) {
                case 'getPlaylists':
                    sendResponse({ playlists: this });
                    break;
                case 'addSongByUrlToPlaylist':
                    var dataSource = new DataSource({
                        url: request.url
                    });

                    dataSource.parseUrl({
                        success: function() {
                            YouTubeV3API.getSong({
                                songId: dataSource.get('id'),
                                success: function(song) {
                                    this.get(request.playlistId).get('items').addSongs(song);

                                    //  TODO: It would be nice to run this in addSongs not here to keep things more DRY.
                                    //  But I kind of feel like I need the playlist title when adding > 1 song (5 songs added to playlist XYZ) which forces it back to the playlist.
                                    Streamus.channels.backgroundNotification.commands.trigger('show:notification', {
                                        title: chrome.i18n.getMessage('songAdded'),
                                        message: song.get('title')
                                    });

                                    //  TODO: This responds success after fetching songs but not after the songs were actually added successfully.
                                    sendResponse({ result: 'success' });
                                }.bind(this),
                                error: function() {
                                    Streamus.channels.backgroundNotification.commands.trigger('show:notification', {
                                        title: chrome.i18n.getMessage('errorEncountered')
                                    });

                                    sendResponse({ result: 'error' });
                                }
                            });
                        }.bind(this),
                        error: function() {
                            Streamus.channels.backgroundNotification.commands.trigger('show:notification', {
                                title: chrome.i18n.getMessage('errorEncountered')
                            });

                            sendResponse({ result: 'error' });
                        }
                    });

                    sendAsynchronousResponse = true;
                    break;
            }

            //  sendResponse becomes invalid after returning you return true to indicate a response will be sent asynchronously.
            return sendAsynchronousResponse;
        },

        _onChangeActive: function(changedPlaylist, active) {
            //  Ensure only one playlist is active at a time by de-activating all other active playlists.
            if (active) {
                this._deactivateAllExcept(changedPlaylist);
                localStorage.setItem('activePlaylistId', changedPlaylist.get('id'));
            }
        },

        _onAdd: function(addedPlaylist, collection, options) {
            //  Add events fire before the playlist is successfully saved to the server so that the UI can show a saving indicator.
            //  This means that addedPlaylist's ID might not be set yet. If that's the case, wait until successful save before relying on it.
            if (addedPlaylist.isNew()) {
                this.listenToOnce(addedPlaylist, 'createError', function() {
                    //  TODO: Do something with this error.
                    this.stopListening(addedPlaylist, 'change:id');
                });

                this.listenToOnce(addedPlaylist, 'change:id', function() {
                    this.stopListening(addedPlaylist, 'createError');
                    this._onCreateSuccess(addedPlaylist, options);
                });
            } else {
                this._onCreateSuccess(addedPlaylist, options);
            }
        },
        //  TODO: added vs created.
        _onCreateSuccess: function(addedPlaylist) {
            //  Notify all open YouTube tabs that a playlist has been added.
            Streamus.channels.tab.commands.trigger('notify:youTube', {
                event: SyncActionType.Added,
                type: ListItemType.Playlist,
                data: {
                    id: addedPlaylist.get('id'),
                    title: addedPlaylist.get('title'),
                    active: addedPlaylist.get('active')
                }
            });

            Streamus.channels.backgroundNotification.commands.trigger('show:notification', {
                title: chrome.i18n.getMessage('playlistCreated'),
                message: addedPlaylist.get('title')
            });

            this._setCanDelete(this.length > 1);
        },
        
        //  Whenever a playlist is removed, if it was selected, select the next playlist.
        _onRemove: function(removedPlaylist, collection, options) {
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
        },

        _activateByIndex: function(index) {
            this.at(index).set('active', true);
        }
    });

    return Playlists;
});