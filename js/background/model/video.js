//  Holds all the relevant data for a video.
define([
    'settings',
    'utility'
], function (Settings, Utility) {
    'use strict';

    var videoModel = Backbone.Model.extend({
        
        defaults: {
            //  Provided by YouTube's API.
            id: '',
            title: '',
            author: '',
            duration: -1,
            
            prettyDuration: '',
            cleanTitle: '',
        },
        
        urlRoot: Settings.get('serverURL') + 'Video/',
        
        initialize: function() {            
            
            this.listenTo(this, 'change:duration', this.setPrettyDuration);
            this.listenTo(this, 'change:title', this.setCleanTitle);
            this.setPrettyDuration();
            this.setCleanTitle();
        },
        
        //  Calculate this value pre-emptively because when rendering I don't want to incur inefficiency
        setPrettyDuration: function() {
            this.set('prettyDuration', Utility.prettyPrintTime(this.get('duration')));
        },
        
        //  Useful for comparisons and other searching.
        setCleanTitle: function() {
            this.set('cleanTitle', Utility.cleanseVideoTitle(this.get('title')));
        }
        
    });

    return function (config) {

        //  Support passing raw YouTube videoInformation instead of a precise config object.
        if (config.videoInformation !== undefined) {

            config.id = config.videoInformation.media$group.yt$videoid.$t;
            config.title = config.videoInformation.title.$t;
            config.duration = parseInt(config.videoInformation.media$group.yt$duration.seconds, 10);
            config.author = config.videoInformation.author[0].name.$t;

        }

        var video = new videoModel(config);
        return video;
    };
});