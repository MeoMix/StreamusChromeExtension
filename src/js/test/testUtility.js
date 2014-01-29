define([
    'background/model/video',
    'background/model/playlistItem'
], function(Video, PlaylistItem) {
    'use strict';

    return {
        //  Construct a basic Video object fit for general testing.
        buildVideo: function() {
            return new Video({
                id: 'M7lc1UVf-VE',
                title: 'YouTube Developers Live: Embedded Web Player Customization',
                author: 'Google Developers',
                duration: '1344'
            });
        },

        //  Construct a basic PlaylistItem object fit for general testing.
        buildPlaylistItem: function() {
            var video = this.buildVideo();

            return new PlaylistItem({
                video: video,
                title: video.get('title')
            });
        }
    };
});