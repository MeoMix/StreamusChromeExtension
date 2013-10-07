define([
    'videoSearchResult'
], function (VideoSearchResult) {
    'use strict';

    var VideoSearchResults = Backbone.Collection.extend({
        model: VideoSearchResult,
        
        initialize: function() {
            
            this.on('change:selected', function (changedItem, selected) {
                
                //  TODO: Support keyboard shortcuts allowing multiple selections
                //  Ensure only one item is selected at a time by de-selecting all other selected item.
                if (selected) {
                    this.deselectAllExcept(changedItem.cid);
                }

            });

        },
        
        deselectAllExcept: function (selectedItemCid) {

            this.each(function(item) {

                if (item.cid != selectedItemCid) {
                    item.set('selected', false);
                }

            });
        },

        selected: function () {
            return this.where({ selected: true });
        }
        
    });

    return new VideoSearchResults;
});