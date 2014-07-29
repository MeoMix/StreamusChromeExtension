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
            this._setPrettyDuration(this.get('duration'));
            this._setCleanTitle(this.get('title'));
            this._setUrl(this.get('id'));

            this.on('change:duration', this._onChangeDuration);
            this.on('change:title', this._onChangeTitle);
            this.on('change:id', this._onChangeId);
        },
        
        //  TODO: Not sure how I feel about this method. Why not just has type set to YouTube and call set?
        setYouTubeInformation: function (songInformation) {
            this.set('type', SongType.YouTube);
            this.set(songInformation);
        },
        
        _onChangeId: function (model, id) {
            this._setUrl(id);
        },
        
        _onChangeTitle: function(model, title) {
            this._setCleanTitle(title);
        },
        
        _onChangeDuration: function(model, duration) {
            this._setPrettyDuration(duration);
        },
        
        //  Calculate this value pre-emptively because when rendering I don't want to incur inefficiency
        _setPrettyDuration: function (duration) {
            this.set('prettyDuration', Utility.prettyPrintTime(duration));
        },
        
        //  Useful for comparisons and other searching.
        _setCleanTitle: function (title) {
            this.set('cleanTitle', Utility.cleanTitle(title));
        },
        
        _setUrl: function (id) {
            this.set('url', 'https://youtu.be/' + id);
        }
    });

    return Song;
});