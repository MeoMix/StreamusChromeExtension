define(['playlist'], function (Playlist) {
    'use strict';

    var Playlists = Backbone.Collection.extend({
        model: Playlist,

        initialize: function () {
            var self = this;

            //  Whenever a playlist is removed -- select the next playlist.
            //  TODO: If the last playlist is removed the 2nd-to-last playlist should be selected, not the first.
            this.on('remove', function (removedPlaylist) {

                if (removedPlaylist.get('active')) {

                    var nextPlaylistId = removedPlaylist.get('nextPlaylistId');
                    self.get(nextPlaylistId).set('active', true);

                }

                if (this.length === 0) {
                    this.trigger('empty');
                }

            });
            
        },
        
        getActivePlaylist: function() {
            return this.findWhere({ active: true });
        }
    });

    return Playlists;
});