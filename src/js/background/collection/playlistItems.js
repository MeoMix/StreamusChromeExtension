define([
    'background/enum/syncActionType',
    'background/collection/multiSelectCollection',
    'background/mixin/sequencedCollectionMixin',
    'background/model/playlistItem',
    'background/model/settings',
    'common/enum/listItemType'
], function (SyncActionType, MultiSelectCollection, SequencedCollectionMixin, PlaylistItem, Settings, ListItemType) {
    'use strict';
    
    var PlaylistItems = MultiSelectCollection.extend(_.extend({}, SequencedCollectionMixin, {
        model: PlaylistItem,
        playlistId: -1,
        
        initialize: function (models, options) {
            if (!_.isUndefined(options)) {
                this.playlistId = options.playlistId;
            }
            
            this.on('add', this._onAdd);
            this.on('remove', this._onRemove);
            
            MultiSelectCollection.prototype.initialize.apply(this, arguments);
        },

        //  Figure out if a Song would be unique to the collection or if it already referenced by a PlaylistItem.
        hasSong: function (song) {
            return !_.isUndefined(this._getBySongId(song.get('id')));
        },
        
        //  Don't allow duplicate PlaylistItems by songId. 
        add: function (items) {
            if (items instanceof Backbone.Collection) {
                items.each(function (item) {
                    this._trySetDuplicateSongId(item);
                }.bind(this));
            }
            else if (_.isArray(items)) {
                _.each(items, function (item) {
                    this._trySetDuplicateSongId(item);
                }.bind(this));
            } else {
                this._trySetDuplicateSongId(items);
            }
            
            return MultiSelectCollection.prototype.add.apply(this, arguments);
        },

        addSongs: function (songs, options) {
            //  Support optional options.
            options = _.isUndefined(options) ? {} : options;

            //  Convert songs to an array when given a single song
            if (!_.isArray(songs)) {
                songs = [songs];
            }

            var itemsToCreate = [];
            var index = !_.isUndefined(options.index) ? options.index : this.length;

            _.each(songs, function (song) {
                if (!this.hasSong(song)) {
                    var sequence = this.getSequenceFromIndex(index);

                    var playlistItem = new PlaylistItem({
                        playlistId: this.playlistId,
                        song: song,
                        sequence: sequence
                    });

                    itemsToCreate.push(playlistItem);
                    this.add(playlistItem);
                    index++;
                }
            }, this);
            
            if (itemsToCreate.length === 1) {
                //  Default to Backbone if only creating 1 item.
                itemsToCreate[0].save({}, {
                    success: options ? options.success : null,
                    error: options ? options.error : null
                });
            } else {
                this._bulkCreate(itemsToCreate, options);
            }
        },
        
        getTotalDuration: function () {
            var songDurations = _.invoke(this.pluck('song'), 'get', 'duration');
            
            var totalDuration = _.reduce(songDurations, function (memo, songDuration) {
                return memo + songDuration;
            }, 0);

            return totalDuration;
        },
        
        _bulkCreate: function(itemsToCreate, options) {
            $.ajax({
                url: Settings.get('serverURL') + 'PlaylistItem/CreateMultiple',
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

        _trySetDuplicateSongId: function (playlistItem) {
            //  You can pass an object into .add so gotta support both types. Maybe rethink this?
            var songId;
            if (playlistItem instanceof Backbone.Model) {
                songId = playlistItem.get('song').get('id');
            } else {
                songId = playlistItem.song.id;
            }

            var duplicateItem = this._getBySongId(songId);

            if (!_.isUndefined(duplicateItem)) {
                //  Make their IDs match to prevent adding to the collection.
                if (duplicateItem.has('id')) {
                    if (playlistItem instanceof Backbone.Model) {
                        playlistItem.set('id', duplicateItem.get('id'));
                    } else {
                        playlistItem.id = duplicateItem.get('id');
                    }
                } else {
                    playlistItem.cid = duplicateItem.cid;
                }
            }
        },
        
        _onAdd: function (addedPlaylistItem) {
            Backbone.Wreqr.radio.channel('sync').vent.trigger('sync', {
                listItemType: ListItemType.PlaylistItem,
                syncActionType: SyncActionType.Added,
                model: addedPlaylistItem
            });
        },
        
        _onRemove: function(removedPlaylistItem) {
            Backbone.Wreqr.radio.channel('sync').vent.trigger('sync', {
                listItemType: ListItemType.Playlist,
                syncActionType: SyncActionType.Removed,
                model: removedPlaylistItem
            });
        }
    }));

    return PlaylistItems;
});