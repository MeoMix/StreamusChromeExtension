define([
    'playlistItem',
    'settings'
], function (PlaylistItem, Settings) {
   'use strict';

    var PlaylistItems = Backbone.Collection.extend({
        model: PlaylistItem,
        
        save: function (attributes, options) {
            
            //  TODO: This doesn't support saving old items yet -- only a bunch of brand new ones.
            if (this.filter(function(item) {
                return !item.isNew();
            }).length > 0) {
                throw "Not Supported Yet";
            }

            var newItems = this.filter(function (item) {
                return item.isNew();
            });

            var newItemsJqXhr = false;
            if (newItems.length === 1) {
                //  Default to Backbone if Collection is creating only 1 item.
                newItems[0].save({}, {
                    success: options ? options.success : null,
                    error: options ? options.error : null
                });
            }
            else if (newItems.length > 1) {

                //  Otherwise revert to a CreateMultiple
                newItemsJqXhr = $.ajax({
                    url: Settings.get('serverURL') + 'PlaylistItem/CreateMultiple',
                    type: 'POST',
                    contentType: 'application/json; charset=utf-8',
                    dataType: 'json',
                    data: JSON.stringify(newItems),
                    error: options ? options.error : null
                });
                
            }

            $.when(newItemsJqXhr).done(function (createdItems) {

                if (createdItems) {

                    //  For each of the createdItems, remap properties back to the old items.
                    _.each(createdItems, function (createdItem) {

                        var matchingNewItem = _.find(newItems, function (newItem) {
                            return newItem.cid == createdItem.cid;
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
                    
                }

            });

        },

        initialize: function () {

            this.on('remove', function (removedPlaylistItem) {

                //  TODO: Select next item??

                if (this.length === 0) {
                    this.trigger('empty');
                }

            });


        }
    });

    return PlaylistItems;
});