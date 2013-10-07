define([
    'utility'
], function (Utility) {
    'use strict';

    //  It's OK to not be DRY here with Video because I need to not couple the Video object with the foreground.
    var VideoSearchResultItem = Backbone.Model.extend({
        
        defaults: {
            
            id: '',
            title: '',
            author: '',
            prettyDuration: '',
            selected: false,
            dragging: false,

            //  Store the whole video info for later use (saving video)
            videoInformation: null
        }

    });

    return function (config) {

        //  Support passing raw YouTube videoInformation instead of a precise config object.
        if (config.videoInformation !== undefined) {

            config.id = config.videoInformation.media$group.yt$videoid.$t;
            config.title = config.videoInformation.title.$t;
            config.prettyDuration = Utility.prettyPrintTime(parseInt(config.videoInformation.media$group.yt$duration.seconds, 10));
            config.author = config.videoInformation.author[0].name.$t;

        }

        var videoSearchResultItem = new VideoSearchResultItem(config);
        return videoSearchResultItem;
    };
})