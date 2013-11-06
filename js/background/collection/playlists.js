define(['playlist'], function (Playlist) {
    'use strict';

    var Playlists = Backbone.Collection.extend({
        model: Playlist,
        
        comparator: 'sequence',

        initialize: function () {
            var self = this;

            //  Whenever a playlist is removed -- select the next playlist.
            //  TODO: If the last playlist is removed the 2nd-to-last playlist should be selected, not the first.
            this.on('remove', function (removedPlaylist) {

                //  TODO: I think this works?
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
            
        },
        
        getActivePlaylist: function() {
            return this.findWhere({ active: true });
        }
    });

    return Playlists;
});