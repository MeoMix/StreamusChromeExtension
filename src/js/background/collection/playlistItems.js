define(function (require) {
    'use strict';

    var SyncActionType = require('background/enum/syncActionType');
    var CollectionMultiSelect = require('background/mixin/collectionMultiSelect');
    var CollectionSequence = require('background/mixin/collectionSequence');
    var CollectionUniqueSong = require('background/mixin/collectionUniqueSong');
    var PlaylistItem = require('background/model/playlistItem');
    var ListItemType = require('common/enum/listItemType');
    var Utility = require('common/utility');

    var PlaylistItems = Backbone.Collection.extend({
        model: PlaylistItem,
        playlistId: -1,
        userFriendlyName: chrome.i18n.getMessage('playlist'),
        mixins: [CollectionMultiSelect, CollectionSequence, CollectionUniqueSong],
        
        url: function () {
            return Streamus.serverUrl + 'PlaylistItem/';
        },
        
        initialize: function (models, options) {
            if (!_.isUndefined(options)) {
                this.playlistId = options.playlistId;
            }
            
            this.on('add', this._onAdd);
            this.on('remove', this._onRemove);
        },

        //  TODO: Rename to saveSongs
        addSongs: function (songs, options) {
            options = _.isUndefined(options) ? {} : options;
            songs = songs instanceof Backbone.Collection ? songs.models : _.isArray(songs) ? songs : [songs];

            var itemsToCreate = [];
            var index = _.isUndefined(options.index) ? this.length : options.index;

            _.each(songs, function (song) {
                var playlistItem = new PlaylistItem({
                    playlistId: this.playlistId,
                    song: song,
                    title: song.get('title'),
                    sequence: this.getSequenceFromIndex(index)
                });

                //  Provide the index that the item will be placed at because allowing re-sorting the collection is expensive.
                this.add(playlistItem, {
                    at: index
                });
                
                //  If the item was added successfully to the collection (not duplicate) then allow for it to be created.
                if (!_.isUndefined(playlistItem.collection)) {
                    itemsToCreate.push(playlistItem);
                    index++;
                }
            }, this);
            
            if (itemsToCreate.length === 1) {
                //  Default to Backbone if only creating 1 item.
                itemsToCreate[0].save({}, {
                    success: options.success,
                    error: options.error
                });
            } else {
                this._bulkCreate(itemsToCreate, options);
            }
        },

        getDisplayInfo: function () {
            var totalItemsDuration = this._getTotalDuration();
            var prettyTimeWithWords = Utility.prettyPrintTimeWithWords(totalItemsDuration);

            var songs = this.pluck('song');
            var songString = chrome.i18n.getMessage(songs.length === 1 ? 'song' : 'songs');

            var displayInfo = songs.length + ' ' + songString + ', ' + prettyTimeWithWords;
            return displayInfo;
        },
        
        _getTotalDuration: function () {
            var songDurations = _.invoke(this.pluck('song'), 'get', 'duration');

            var totalDuration = _.reduce(songDurations, function (memo, songDuration) {
                return memo + songDuration;
            }, 0);

            return totalDuration;
        },
        
        _bulkCreate: function(itemsToCreate, options) {
            $.ajax({
                url: Streamus.serverUrl + 'PlaylistItem/CreateMultiple',
                type: 'POST',
                contentType: 'application/json; charset=utf-8',
                data: JSON.stringify(itemsToCreate),
                success: function (createdItems) {
                    //  For each of the createdItems, remap properties back to the old items.
                    _.each(createdItems, function (createdItem) {
                        //  Remap items based on their client id.
                        var matchingNewItem = this.find(function (newItem) {
                            return newItem.cid === createdItem.cid;
                        });

                        //  Call parse to emulate going through the Model's save logic.
                        var parsedNewItem = matchingNewItem.parse(createdItem);

                        //  Call set to move attributes from parsedCreatedItem to matchingItemToCreate.
                        matchingNewItem.set(parsedNewItem);
                    }, this);
                    
                    if (options && options.success) {
                        options.success();
                    }
                }.bind(this),
                error: options ? options.error : null
            });
        },
       
        _getBySongId: function (songId) {
            return this.find(function (playlistItem) {
                return playlistItem.get('song').get('id') === songId;
            });
        },
        
        _onAdd: function (addedPlaylistItem) {
            Streamus.channels.sync.vent.trigger('sync', {
                listItemType: ListItemType.PlaylistItem,
                syncActionType: SyncActionType.Added,
                model: addedPlaylistItem
            });
        },
        
        _onRemove: function(removedPlaylistItem) {
            Streamus.channels.sync.vent.trigger('sync', {
                listItemType: ListItemType.Playlist,
                syncActionType: SyncActionType.Removed,
                model: removedPlaylistItem
            });
        }
    });

    return PlaylistItems;
});