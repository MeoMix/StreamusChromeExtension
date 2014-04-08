//  Holds information relevant to a song, either from YouTube or SoundCloud.
define([
    'background/model/settings',
    'common/enum/songType',
    'common/model/utility'
], function (Settings, SongType, Utility) {
    'use strict';

    var Song = Backbone.Model.extend({
        
        defaults: function () {
            return {
                //  ID is either a YouTube Video ID or a SoundCloud Song ID.
                id: '',
                //  Title is immutable. PlaylistItem might support editing the title, but applied to the PlaylistItem and not to Song.
                title: '',
                author: '',
                //  Duration in seconds for the length of the given song.
                duration: -1,
                highDefinition: false,
                type: SongType.None,
                
                //  These are calculated:
                prettyDuration: '',
                url: '',
                cleanTitle: ''
            };
            
        },
        
        //  Song is never saved to the server -- it gets flattened into a PlaylistItem
        sync: function() {
            return false;
        },
        
        initialize: function () {
            this.setPrettyDuration();
            this.setCleanTitle();
            this.setURL();

            //  Whenever Song is updated via setYouTubeInformation (or other ways), re-calculate values.
            this.on('change:duration', this.setPrettyDuration);
            this.on('change:title', this.setCleanTitle);
            this.on('change:id', this.setURL);
        },
        
        //  Calculate this value pre-emptively because when rendering I don't want to incur inefficiency
        setPrettyDuration: function () {
            this.set('prettyDuration', Utility.prettyPrintTime(this.get('duration')));
        },
        
        //  Useful for comparisons and other searching.
        setCleanTitle: function() {
            this.set('cleanTitle', Utility.cleanTitle(this.get('title')));
        },
        
        setURL: function () {
            this.set('url', 'https://youtu.be/' + this.get('id'));
        },
        
        //  TODO: Not necessary now.
        setYouTubeInformation: function (songInformation) {
            this.set('type', SongType.YouTube);
            this.set(songInformation);
        }
        
    });

    return Song;
});