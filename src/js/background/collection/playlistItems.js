define([
    'background/collection/multiSelectCollection',
    'background/mixin/sequencedCollectionMixin',
    'background/model/playlistItem',
    'background/model/settings'
], function (MultiSelectCollection, SequencedCollectionMixin, PlaylistItem, Settings) {
    'use strict';
    
    var PlaylistItems = MultiSelectCollection.extend(_.extend({}, SequencedCollectionMixin, {
        model: PlaylistItem,
        playlistId: -1,
        
        initialize: function (models, options) {
            if (!_.isUndefined(options)) {
                this.playlistId = options.playlistId;
            }
            
            MultiSelectCollection.prototype.initialize.apply(this, arguments);
        },

        save: function (attributes, options) {
            var self = this;
            
            if (this.filter(function(item) {
                return !item.isNew();
            }).length > 0) {
                throw new Error('Not Supported Yet');
            }

            var newItems = this.filter(function (item) {
                return item.isNew();
            });

            if (newItems.length === 1) {
                //  Default to Backbone if Collection is creating only 1 item.
                newItems[0].save({}, {
                    success: options ? options.success : null,
                    error: options ? options.error : null
                });
            }
            else if (newItems.length > 1) {
                
                //  Otherwise revert to a CreateMultiple
                $.ajax({
                    url: Settings.get('serverURL') + 'PlaylistItem/CreateMultiple',
                    type: 'POST',
                    contentType: 'application/json; charset=utf-8',
                    data: JSON.stringify(newItems),
                    success: function (createdItems) {
                        //  For each of the createdItems, remap properties back to the old items.
                        _.each(createdItems, function (createdItem) {
                            //  Remap items based on their client id.
                            var matchingNewItem = self.find(function (newItem) {
                                return newItem.cid === createdItem.cid;
                            });
                            
                            //  Call parse to emulate going through the Model's save logic.
                            var parsedNewItem = matchingNewItem.parse(createdItem);

                            //  Call set to move attributes from parsedCreatedItem to matchingItemToCreate.
                            matchingNewItem.set(parsedNewItem);
                        });

                        if (options && options.success) {
                            options.success();
                        }
                    },
                    error: options ? options.error : null
                });
            }
        },
        
        //  Figure out if a Song would be unique to the collection or if it already referenced by a PlaylistItem.
        hasSong: function (song) {
            return !_.isUndefined(this.getBySongId(song.get('id')));
        },
        
        getBySongId: function (songId) {
            return this.find(function(playlistItem) {
                return playlistItem.get('song').get('id') === songId;
            });
        },
        
        //  Don't allow duplicate PlaylistItems by songId. 
        add: function (items) {
            if (items instanceof Backbone.Collection) {
                items.each(function (item) {
                    this.trySetDuplicateSongId(item);
                }.bind(this));
            }
            else if (_.isArray(items)) {
                _.each(items, function (item) {
                    this.trySetDuplicateSongId(item);
                }.bind(this));
            } else {
                this.trySetDuplicateSongId(items);
            }
            
            return MultiSelectCollection.prototype.add.apply(this, arguments);
        },
        
        trySetDuplicateSongId: function (playlistItem) {
            //  You can pass an object into .add so gotta support both types. Maybe rethink this?
            var songId;
            if (playlistItem instanceof Backbone.Model) {
                songId = playlistItem.get('song').get('id');
            } else {
                songId = playlistItem.song.id;
            }
            
            var duplicateItem = this.getBySongId(songId);
            
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
        
        addSongs: function (songs, options) {
            //  Support optional options.
            options = _.isUndefined(options) ? {} : options;

            //  Convert songs to an array when given a single song
            if (!_.isArray(songs)) {
                songs = [songs];
            }

            var itemsToSave = new PlaylistItems([], {
                playlistId: this.playlistId
            });

            var index = !_.isUndefined(options.index) ? options.index : this.length;

            _.each(songs, function (song) {
                if (!this.hasSong(song)) {
                    var sequence = this.getSequenceFromIndex(index);

                    var playlistItem = new PlaylistItem({
                        playlistId: this.playlistId,
                        song: song,
                        sequence: sequence
                    });

                    itemsToSave.push(playlistItem);
                    this.add(playlistItem);
                    index++;
                }
            }, this);

            itemsToSave.save({}, {
                success: options.success,
                error: options.error
            });
        },
    }));

    return PlaylistItems;
});