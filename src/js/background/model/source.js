//  Holds information relevant to a song, either from YouTube or SoundCloud.
define([
    'background/model/settings',
    'common/enum/sourceType',
    'common/model/utility'
], function (Settings, SourceType, Utility) {
    'use strict';

    var Source = Backbone.Model.extend({
        
        defaults: function () {
            return {
                //  ID is either a YouTube Video ID or a SoundCloud Song ID.
                id: '',
                //  Title is immutable. PlaylistItem might support editing the title, but applied to the PlaylistItem and not to Source.
                title: '',
                author: '',
                //  Duration in seconds for the length of the given song.
                duration: -1,
                highDefinition: false,
                type: SourceType.None,
                
                //  These are calculated:
                prettyDuration: '',
                url: '',
                cleanTitle: ''
            };
            
        },
        
        //  Source is never saved to the server -- it gets flattened into a PlaylistItem
        sync: function() {
            return false;
        },
        
        initialize: function () {
            this.setPrettyDuration();
            this.setCleanTitle();
            this.setURL();

            this.on('change:duration', this.setPrettyDuration);
        },
        
        //  Calculate this value pre-emptively because when rendering I don't want to incur inefficiency
        setPrettyDuration: function () {
            console.log("Duration:", this.get('duration'));
            this.set('prettyDuration', Utility.prettyPrintTime(this.get('duration')));
        },
        
        //  Useful for comparisons and other searching.
        setCleanTitle: function() {
            this.set('cleanTitle', Utility.cleanTitle(this.get('title')));
        },
        
        setURL: function() {
            this.set('url', 'https://youtu.be/' + this.get('id'));
        },
        
        setYouTubeVideoInformation: function (videoInformation) {

            this.set('type', SourceType.YouTube);
            
            //  v3 API videoInformation will have the id stored directly in the information object.
            //  TODO: Need a better v3 detector than this.
            if (videoInformation.id && videoInformation.id.length === 11) {
                this.set(config.videoInformation);
            } else {
                this.set({
                    id: videoInformation.media$group.yt$videoid.$t,
                    title: videoInformation.title.$t,
                    duration: parseInt(videoInformation.media$group.yt$duration.seconds, 10),
                    author: videoInformation.author[0].name.$t,
                    highDefinition: videoInformation.yt$hd != null
                });
            }

        }
        
    });

    return Source;
});