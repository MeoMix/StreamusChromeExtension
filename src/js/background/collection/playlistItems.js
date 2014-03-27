define([
    'background/collection/multiSelectCollection',
    'background/mixin/sequencedCollectionMixin',
    'background/model/playlistItem',
    'background/model/settings'
], function (MultiSelectCollection, SequencedCollectionMixin, PlaylistItem, Settings) {
    //  TODO: Fix this.
    //'use strict';
    
    var PlaylistItems = MultiSelectCollection.extend({
        model: PlaylistItem,

        comparator: 'sequence',
        
        initialize: function (models, options) {
            //  TODO: Kinda weird. Maybe collections shouldn't know their parent ID.
            this.playlistId = options.playlistId;
            
            MultiSelectCollection.prototype.initialize.call(this, arguments);
        },

        save: function (attributes, options) {
            var self = this;
            
            //  TODO: This doesn't support saving old items yet -- only a bunch of brand new ones.
            if (this.filter(function(item) {
                return !item.isNew();
            }).length > 0) {
                throw "Not Supported Yet";
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

                            //  Title is unique so just match on that. No need to rely on passing cid to server and back. 
                            var matchingNewItem = self.find(function (newItem) {
                                return newItem.get('title') === createdItem.title;
                            });
                            
                            //  Call parse to emulate going through the Model's save logic.
                            var parsedNewItem = matchingNewItem.parse(createdItem);

                            //  Call set to move attributes from parsedCreatedItem to matchingItemToCreate.
                            matchingNewItem.set(parsedNewItem);
                        });

                        //  TODO: Pass intelligent paramaters back to options.success
                        if (options.success) {
                            options.success();
                        }
                        
                    },
                    error: options ? options.error : null
                });
                
            }

        },

        savePlaylistItem: function (playlistItem, callback) {

            if (this.songAlreadyExists(playlistItem.get('song'))) {
                //  TODO: No real indication of failure due to non-uniqueness.
                if (callback) {
                    callback(playlistItem);
                }
            }
            else {

                //  TODO: I think it would be nice to support adding immediately and fixing if it fails to save.
                //  Save the playlistItem, but push after version from server because the ID will have changed.
                playlistItem.save({}, {

                    success: function () {
                        
                        this.add(playlistItem);

                        if (callback) {
                            callback(playlistItem);
                        }

                    }.bind(this)
                });
            }

        },
        
        //  Figure out if an item is already in the collection by songId to allow for preventing duplicates.
        songAlreadyExists: function(song) {
            return this.some(function (playlistItem) {
                return playlistItem.get('song').get('id') === song.get('id');
            });
        }
        
    });
    
    function trySetDuplicateSongId(playlistItemToAdd) {
        var duplicatePlaylistItem = this.find(function (playlistItem) {
            return playlistItem.get('song').get('id') === playlistItemToAdd.get('song').get('id');
        });

        var duplicateFound = !_.isUndefined(duplicatePlaylistItem);

        if (duplicateFound) {

            //  Make their IDs match to prevent adding to the collection.
            //  TODO: Is there a more clear way to do this?
            if (duplicatePlaylistItem.has('id')) {
                playlistItemToAdd.set('id', duplicatePlaylistItem.get('id'));
            } else {
                playlistItemToAdd.cid = duplicatePlaylistItem.cid;
            }

        }
    }
    
    //  TODO: Do I have to extend prototype or can I just define add: inside PlaylistItem?
    //  Don't allow duplicate PlaylistItems by songId. 
    PlaylistItems.prototype.add = function (playlistItemToAdd, options) {
        
        if (_.isArray(playlistItemToAdd)) {
            _.each(playlistItemToAdd, function(itemToAdd) {
                trySetDuplicateSongId.call(this, itemToAdd);
            }.bind(this));
        } else {
            trySetDuplicateSongId.call(this, playlistItemToAdd);
        }

        return MultiSelectCollection.prototype.add.call(this, playlistItemToAdd, options);
    };

    //  Mixin methods needed for sequenced collections
    _.extend(PlaylistItems.prototype, SequencedCollectionMixin);

    return PlaylistItems;
});