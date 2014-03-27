define([
    'background/model/song',
    'background/model/playlistItem'
], function(Song, PlaylistItem) {
    'use strict';

    return {
        //  Construct a basic Song object fit for general testing.
        buildSong: function() {
            return new Song({
                id: 'M7lc1UVf-VE',
                title: 'YouTube Developers Live: Embedded Web Player Customization',
                author: 'Google Developers',
                duration: '1344'
            });
        },

        //  Construct a basic PlaylistItem object fit for general testing.
        buildPlaylistItem: function() {
            var song = this.buildSong();

            return new PlaylistItem({
                song: song,
                title: song.get('title')
            });
        }
    };
});