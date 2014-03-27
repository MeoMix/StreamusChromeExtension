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
            console.log("playlistItem parse being called", playlistItemDto);

            //  Map the DTO's flattened Song properties into an actual Song object.
            this.set('song', new Song({
                id: playlistItemDto.songId,
                title: playlistItemDto.songTitle,
                type: playlistItemDto.songType,
                author: playlistItemDto.author,
                duration: playlistItemDto.duration,
                highDefinition: playlistItemDto.highDefinition
            }));
            
            //  Delete to prevent overriding on return of data object.
            delete playlistItemDto.songId;
            delete playlistItemDto.songTitle;
            delete playlistItemDto.songType;
            delete playlistItemDto.author;
            delete playlistItemDto.duration;
            delete playlistItemDto.highDefinition;

            return playlistItemDto;
        },
        
        toJSON: function () {
            
            //  Flatten the JSON being sent back to the server because only want to save a PlaylistItem and not a Song.
            var json = Backbone.Model.prototype.toJSON.apply(this, arguments);

            var song = this.get('song');

            //  TODO: I don't want to send song across to the server, but I do want to use it in my templating -- how to do that?
            //  Maybe my server's DTO should have a Song but be responsible for flattening?
            //delete json.song;
            json.songId = song.get('id');
            json.songTitle = song.get('title');
            json.songType = song.get('type');
            json.author = song.get('author');
            json.duration = song.get('duration');
            json.highDefinition = song.get('highDefinition');

            return json;
        },
        

        initialize: function () {
            //  TODO: Parse isn't called when User is loaded. need to fix!!!

            if (!this.has('song')) {
                console.log("Detected no song, parsing");
                this.set(this.parse(this.attributes));

                console.log("This:", this);
            }

            //  TODO: Can this just be combined into parse with a simple new Song?
            console.log("playlistItem initialize being called", this);
            //var song = this.get('song');

            //  Need to convert song object to Backbone.Model
            //if (!(song instanceof Backbone.Model)) {
            //    song = new Song(song);
            //    //  Silent because song is just being properly set.
            //    this.set('song', song, { silent: true });
            //}

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