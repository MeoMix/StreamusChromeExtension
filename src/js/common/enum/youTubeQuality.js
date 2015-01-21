define(function (require) {
    'use strict';

    var SongQuality = require('common/enum/songQuality');

    var YouTubeQuality = {
        Highres: 'highres',
        Default: 'default',
        Small: 'small',

        //  TODO: Remove this. It's a bad idea.
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