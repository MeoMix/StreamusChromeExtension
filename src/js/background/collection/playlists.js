define([
    'background/enum/syncActionType',
    'background/mixin/sequencedCollectionMixin',
    'background/model/playlist',
    'background/model/settings',
    'background/model/song',
    'common/enum/listItemType',
    'common/model/youTubeV3API'
], function (SyncActionType, SequencedCollectionMixin, Playlist, Settings, Song, ListItemType, YouTubeV3API) {
    'use strict';

    var Playlists = Backbone.Collection.extend(_.extend({}, SequencedCollectionMixin, {
        model: Playlist,
        userId: null,
        
        initialize: function () {
            chrome.runtime.onMessage.addListener(this._onRuntimeMessage.bind(this));
            this.on('add', this._onAdd);
            this.on('remove', this._onRemove);
            this.on('change:active', this._onChangeActive);
            this.on('change:title', this._onChangeTitle);
            this.on('reset', this._onReset);
        },
        
        setUserId: function(userId) {
            this.userId = userId;
        },
        
        //  Disallow the deletion of the last playlist.
        canDelete: function () {
            return this.length > 1;
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
        
        _deactivateAllExcept: function (changedPlaylist) {
            this.each(function (playlist) {
                if (playlist !== changedPlaylist) {
                    playlist.set('active', false);
                }
            });
        },
        
        _onReset: function() {
            //  Ensure there is an always active playlist by trying to load from localstorage
            if (this.length > 0 && _.isUndefined(this.getActivePlaylist())) {
                var activePlaylistId = localStorage.getItem('activePlaylistId');

                //  Be sure to always have an active playlist if there is one available.
                var playlistToSetActive = this.get(activePlaylistId) || this.at(0);

                console.log('Making this playlist active', playlistToSetActive);
                playlistToSetActive.set('active', true);
            }
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

                            sendResponse({ result: 'success' });
                        }.bind(this),
                        error: function () {
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
        
        _onAdd: function (addedPlaylist) {
            //  TODO: This should probably use the same event system as SyncActions.
            //  Notify all open YouTube tabs that a playlist has been added.
            this._sendEventToOpenYouTubeTabs('add', 'playlist', {
                id: addedPlaylist.get('id'),
                title: addedPlaylist.get('title')
            });

            Backbone.Wreqr.radio.channel('sync').vent.trigger('sync', {
                listItemType: ListItemType.Playlist,
                syncActionType: SyncActionType.Added,
                model: addedPlaylist
            });
        },
        
        //  Whenever a playlist is removed, if it was selected, select the next playlist.
        _onRemove: function (removedPlaylist, collection, options) {
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
            
            //  TODO: This should probably use the same event system as SyncActions.
            //  Notify all open YouTube tabs that a playlist has been removed.
            this._sendEventToOpenYouTubeTabs('remove', 'playlist', {
                id: removedPlaylist.get('id'),
                title: removedPlaylist.get('title')
            });
            
            Backbone.Wreqr.radio.channel('sync').vent.trigger('sync', {
                listItemType: ListItemType.Playlist,
                syncActionType: SyncActionType.Removed,
                model: removedPlaylist
            });
        },
        
        _onChangeTitle: function(changedPlaylist, title) {
            //  Notify all open YouTube tabs that a playlist has been renamed.
            this._sendEventToOpenYouTubeTabs('rename', 'playlist', {
                id: changedPlaylist.get('id'),
                title: title
            });
        },
        
        _sendEventToOpenYouTubeTabs: function (event, type, data) {
            //  TODO: Simplify this and re-use the matching URL everywhere.
            chrome.tabs.query({ url: '*://*.youtube.com/watch?*' }, function (tabs) {
                _.each(tabs, function (tab) {
                    chrome.tabs.sendMessage(tab.id, {
                        event: event,
                        type: type,
                        data: data
                    });
                });
            });
            
            chrome.tabs.query({ url: '*://*.youtu.be/*' }, function (tabs) {
                _.each(tabs, function (tab) {
                    chrome.tabs.sendMessage(tab.id, {
                        event: event,
                        type: type,
                        data: data
                    });
                });
            });
        }
    }));

    //  Exposed globally so that the foreground can access the same instance through chrome.extension.getBackgroundPage()
    window.Playlists = new Playlists();
    return window.Playlists;
});