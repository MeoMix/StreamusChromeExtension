define([
    'background/model/settings',
    'background/model/song'
], function (Settings, Song) {
    'use strict';
    
    var PlaylistItem = Backbone.Model.extend({
        defaults: function() {
            return {
                id: null,
                playlistId: null,
                sequence: -1,
                song: null,
                title: '',
                selected: false,
                firstSelected: false
            };
        },
        
        //  TODO: Move this to PlaylistItems
        urlRoot: Settings.get('serverURL') + 'PlaylistItem/',
        
        //  TODO: Parse isn't being called when a User is loaded because Backbone doesn't trickle down child views.
        parse: function (playlistItemDto) {
            
            //  Convert C# Guid.Empty into BackboneJS null
            for (var key in playlistItemDto) {
                if (playlistItemDto.hasOwnProperty(key) && playlistItemDto[key] === '00000000-0000-0000-0000-000000000000') {
                    playlistItemDto[key] = null;
                }
            }

            // Take json of song and set into model. Delete to prevent overriding on return of data object.
            this.get('song').set(playlistItemDto.song);
            delete playlistItemDto.song;

            return playlistItemDto;
        },

        initialize: function () {
            var song = this.get('song');

            //  Need to convert song object to Backbone.Model
            if (!(song instanceof Backbone.Model)) {
                song = new Song(song);
                //  Silent because song is just being properly set.
                this.set('song', song, { silent: true });
            }

        }
    });

    //  TODO: Move this into initialize or something instead of wrapping if possible?
    //  Public exposure of a constructor for building new PlaylistItem objects.
    return function (config) {

        //  Default the PlaylistItem's title to the Song's title, but allow overriding.
        if (config && config.title === undefined || config.title === '') {
            //  Support data coming straight from the server and being used to initialize
            //  TODO: I can't use instanceof Backbone.Model here because if the Song came from the foreground and this is evaluated in the background
            //  instanceof Backbone.Model returns false even if the Song really is a Backbone.Model.
            //config.title = config.song instanceof Backbone.Model ? config.song.get('title') : config.title;
            config.title = config.song.get ? config.song.get('title') : config.song.title;
        }

        var playlistItem = new PlaylistItem(config);
        return playlistItem;
    };
});