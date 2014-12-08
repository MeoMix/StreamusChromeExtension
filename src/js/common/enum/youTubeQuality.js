define([
    'common/enum/songQuality'
], function (SongQuality) {
    'use strict';

    var YouTubeQuality = {
        Highres: 'highres',
        Default: 'default',
        Small: 'small',

        fromSongQuality: function (songQuality) {
            var youTubeQuality = YouTubeQuality.Default;
            
            //  Transform generic SongQuality into YouTube-specific quality.
            switch (songQuality) {
                case SongQuality.Highest:
                    youTubeQuality = YouTubeQuality.Highres;
                    break;
                case SongQuality.Auto:
                    youTubeQuality = YouTubeQuality.Default;
                    break;
                case SongQuality.Lowest:
                    youTubeQuality = YouTubeQuality.Small;
                    break;
                default:
                    console.error('Unhandled SongQuality: ', songQuality);
                    break;
            }

            return youTubeQuality;
        }
    };

    return YouTubeQuality;
});