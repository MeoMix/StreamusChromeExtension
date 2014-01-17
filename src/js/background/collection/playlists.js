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
            this.on('remove', function (removedPlaylist) {
                
                if (removedPlaylist.get('active')) {

                    var nextPlaylist = this.find(function (playlist) {
                        return playlist.get('sequence') > removedPlaylist.get('sequence');
                    });

                    if (nextPlaylist === undefined) {
                        this.at(0).set('active', true);
                    } else {
                        nextPlaylist.set('active', true);
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