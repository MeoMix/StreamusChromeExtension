define([
    'background/model/source',
    'background/model/playlistItem'
], function(Source, PlaylistItem) {
    'use strict';

    return {
        //  Construct a basic Source object fit for general testing.
        buildSource: function() {
            return new Source({
                id: 'M7lc1UVf-VE',
                title: 'YouTube Developers Live: Embedded Web Player Customization',
                author: 'Google Developers',
                duration: '1344'
            });
        },

        //  Construct a basic PlaylistItem object fit for general testing.
        buildPlaylistItem: function() {
            var source = this.buildSource();

            return new PlaylistItem({
                source: source,
                title: source.get('title')
            });
        }
    };
});