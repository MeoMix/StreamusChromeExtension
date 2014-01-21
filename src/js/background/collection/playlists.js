define([
    'background/mixin/sequencedCollectionMixin',
    'background/model/playlist'
], function (SequencedCollectionMixin, Playlist) {
    'use strict';

    var Playlists = Backbone.Collection.extend({
        model: Playlist,
        
        comparator: 'sequence',

        initialize: function () {

            //  Whenever a playlist is removed, if it was selected, select the next playlist.
            this.on('remove', function (removedPlaylist, collection, options) {

                if (removedPlaylist.get('active')) {

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

            });
            
            this.on('change:active', function (changedPlaylist, active) {

                //  Ensure only one playlist is selected at a time by de-selecting all other selected playlists.
                if (active) {
                    this.deselectAllExcept(changedPlaylist.get('id'));
                }

            });
            
        },
        
        //  Disallow the deletion of the last playlist.
        canDelete: function () {
            return this.length > 1;
        },
        
        getActivePlaylist: function() {
            return this.findWhere({ active: true });
        },
        
        deselectAllExcept: function (playlistId) {

            this.each(function (playlist) {

                if (playlist.get('id') !== playlistId) {
                    playlist.set('active', false);
                }

            });

        }
        
    });
    
    //  Mixin methods needed for sequenced collections
    _.extend(Playlists.prototype, SequencedCollectionMixin);

    return Playlists;
});