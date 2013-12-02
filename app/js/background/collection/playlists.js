define(['playlist'], function (Playlist) {
    'use strict';

    var Playlists = Backbone.Collection.extend({
        model: Playlist,
        
        comparator: 'sequence',

        initialize: function () {
            var self = this;

            //  Whenever a playlist is removed -- select the next playlist.
            this.on('remove', function (removedPlaylist) {

                var nextPlaylist = self.find(function (playlist) {
                    return playlist.get('sequence') > removedPlaylist.get('sequence');
                });
                
                if (nextPlaylist === undefined) {
                    self.at(0).set('active', true);
                } else {
                    nextPlaylist.set('active', true);
                }

                if (this.length === 0) {
                    this.trigger('empty');
                }

            });
            
            this.on('change:active', function (changedPlaylist, active) {
                console.log("changeActive is firing");
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

    return Playlists;
});