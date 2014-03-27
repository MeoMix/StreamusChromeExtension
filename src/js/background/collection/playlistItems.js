define([
    'background/collection/multiSelectCollection',
    'background/mixin/sequencedCollectionMixin',
    'background/model/playlistItem',
    'background/model/settings'
], function (MultiSelectCollection, SequencedCollectionMixin, PlaylistItem, Settings) {
    'use strict';
    
    var PlaylistItems = MultiSelectCollection.extend(_.extend({}, SequencedCollectionMixin, {
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
        
        //  Figure out if a Song would be unique to the collection or if it already referenced by a PlaylistItem.
        hasSong: function (song) {
            return !_.isUndefined(this.getBySongId(song.get('id')));
        },
        
        getBySongId: function(songId) {
            return this.find(function(playlistItem) {
                return playlistItem.get('song').get('id') === songId;
            });
        },
        
        //  Don't allow duplicate PlaylistItems by songId. 
        add: function (items, options) {
        
            if (items instanceof Backbone.Collection) {
                items.each(function (item) {
                    this.trySetDuplicateSongId.call(item);
                }.bind(this));
            }
            else if (_.isArray(items)) {
                _.each(items, function (item) {
                    this.trySetDuplicateSongId.call(item);
                }.bind(this));
            } else {
                this.trySetDuplicateSongId(items);
            }

            return MultiSelectCollection.prototype.add.call(this, items, options);
        },
        
        trySetDuplicateSongId: function (playlistItemToAdd) {
            var duplicateItem = this.getBySongId(playlistItemToAdd.get('song').get('id'));

            if (!_.isUndefined(duplicateItem)) {

                //  Make their IDs match to prevent adding to the collection.
                if (duplicateItem.has('id')) {
                    playlistItemToAdd.set('id', duplicateItem.get('id'));
                } else {
                    playlistItemToAdd.cid = duplicateItem.cid;
                }

            }
        }
        
    }));

    return PlaylistItems;
});