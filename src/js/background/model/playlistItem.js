//  PlaylistItems have a one-to-one relationship with a Video object via the videoId property.
define([
    'background/model/settings',
    'background/model/video'
], function (Settings, Video) {
    'use strict';
    
    var PlaylistItem = Backbone.Model.extend({
        defaults: function() {
            return {
                id: null,
                playlistId: null,
                sequence: -1,
                video: null,
                title: '',
                
                //  TODO: Not stored on the server... not sure if that's a big deal just yet.
                selected: false,
                firstSelected: false
            };
        },
        urlRoot: Settings.get('serverURL') + 'PlaylistItem/',
        parse: function (playlistItemDto) {
            
            //  Convert C# Guid.Empty into BackboneJS null
            for (var key in playlistItemDto) {
                if (playlistItemDto.hasOwnProperty(key) && playlistItemDto[key] === '00000000-0000-0000-0000-000000000000') {
                    playlistItemDto[key] = null;
                }
            }

            // Take json of video and set into model. Delete to prevent overriding on return of data object.
            this.get('video').set(playlistItemDto.video);
            delete playlistItemDto.video;

            return playlistItemDto;
        },
        toJSON: function () {
            //  Backbone Model's toJSON doesn't automatically send cid across, but I want it for re-mapping collections after server saves.
            var json = Backbone.Model.prototype.toJSON.apply(this, arguments);
            json.cid = this.cid;
            return json;
        },
        initialize: function () {
            var video = this.get('video');

            //  Need to convert video object to Backbone.Model
            if (!(video instanceof Backbone.Model)) {
                video = new Video(video);
                //  Silent because video is just being properly set.
                this.set('video', video, { silent: true });
            }

        }
    });

    //  TODO: Move this into initialize or something instead of wrapping if possible?
    //  Public exposure of a constructor for building new PlaylistItem objects.
    return function (config) {

        //  Default the PlaylistItem's title to the Video's title, but allow overriding.
        if (config && config.title === undefined || config.title === '') {
            //  Support data coming straight from the server and being used to initialize
            //  TODO: I can't use instanceof Backbone.Model here because if the Video came from the foreground and this is evaluated in the background
            //  instanceof Backbone.Model returns false even if the Video really is a Backbone.Model.
            //config.title = config.video instanceof Backbone.Model ? config.video.get('title') : config.title;
            config.title = config.video.get ? config.video.get('title') : config.video.title;
        }

        var playlistItem = new PlaylistItem(config);
        return playlistItem;
    };
});