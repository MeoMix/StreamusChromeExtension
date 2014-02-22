//  Holds all the relevant data for a video.
define([
    'background/model/settings',
    'common/model/utility'
], function (Settings, Utility) {
    'use strict';

    var Video = Backbone.Model.extend({
        
        defaults: function () {
            return {
                //  Provided by YouTube's API.
                id: '',
                title: '',
                author: '',
                duration: -1,
                
                //  These are calculated:
                prettyDuration: '',
                url: '',
                cleanTitle: '',
                highDefinition: false
            };
            
        },
        
        urlRoot: Settings.get('serverURL') + 'Video/',
        
        initialize: function() {            
            
            this.on('change:duration', this.setPrettyDuration);
            this.on('change:title', this.setCleanTitle);
            this.on('change:id', this.setURL);

            this.setPrettyDuration();
            this.setCleanTitle();
            this.setURL();
        },
        
        //  Calculate this value pre-emptively because when rendering I don't want to incur inefficiency
        setPrettyDuration: function() {
            this.set('prettyDuration', Utility.prettyPrintTime(this.get('duration')));
        },
        
        //  Useful for comparisons and other searching.
        setCleanTitle: function() {
            this.set('cleanTitle', Utility.cleanseVideoTitle(this.get('title')));
        },
        
        setURL: function() {
            this.set('url', 'https://youtu.be/' + this.get('id'));
        }
        
    });

    return function (config) {

        if (config === undefined) throw "Video expects to be constructed with either videoInformation or properties";
        
        //  Support passing raw YouTube videoInformation instead of a precise config object.
        if (config.videoInformation !== undefined) {
            
            //  v3 API videoInformation will have the id stored directly in the information object.
            //  TODO: Need a better v3 detector than this lol.
            if (config.videoInformation.id && config.videoInformation.id.length === 11) {
                $.extend(config, config.videoInformation);
            } else {
                config.id = config.videoInformation.media$group.yt$videoid.$t;
                config.title = config.videoInformation.title.$t;
                config.duration = parseInt(config.videoInformation.media$group.yt$duration.seconds, 10);
                config.author = config.videoInformation.author[0].name.$t;
                config.highDefinition = config.videoInformation.yt$hd != null;
            }

            delete config.videoInformation;
        }

        var video = new Video(config);
        return video;
    };
});