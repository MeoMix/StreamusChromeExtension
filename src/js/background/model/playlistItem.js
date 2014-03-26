define([
    'background/model/settings',
    'background/model/source'
], function (Settings, Source) {
    'use strict';
    
    var PlaylistItem = Backbone.Model.extend({
        defaults: function() {
            return {
                id: null,
                playlistId: null,
                sequence: -1,
                source: null,
                title: '',
                selected: false,
                firstSelected: false
            };
        },
        
        //  TODO: Move this to PlaylistItems
        urlRoot: Settings.get('serverURL') + 'PlaylistItem/',
        
        parse: function (playlistItemDto) {
            
            //  Convert C# Guid.Empty into BackboneJS null
            for (var key in playlistItemDto) {
                if (playlistItemDto.hasOwnProperty(key) && playlistItemDto[key] === '00000000-0000-0000-0000-000000000000') {
                    playlistItemDto[key] = null;
                }
            }
            console.log("playlistItem parse being called");
            //  TODO: Is it actually a Source object already here?
            //  Map the DTO's flattened Source properties into an actual Source object.
            this.get('source').set({
                id: playlistItemDto.sourceId,
                title: playlistItemDto.sourceTitle,
                author: playlistItemDto.author,
                duration: playlistItemDto.duration,
                highDefinition: playlistItemDto.highDefinition,
                type: playlistItemDto.sourceType
            });
            
            //  Delete to prevent overriding on return of data object.
            delete playlistItemDto.sourceId;
            delete playlistItemDto.sourceTitle;
            delete playlistItemDto.author;
            delete playlistItemDto.duration;
            delete playlistItemDto.highDefinition;
            delete playlistItemDto.sourceType;

            return playlistItemDto;
        },
        
        toJSON: function () {
            
            //  Flatten the JSON being sent back to the server because only want to save a PlaylistItem and not a Source.
            var json = Backbone.Model.prototype.toJSON.apply(this, arguments);

            var source = this.get('source');

            json.sourceId = source.get('id');
            json.sourceTitle = source.get('title');
            json.sourceType = source.get('type');
            json.author = source.get('author');
            json.duration = source.get('duration');
            json.highDefinition = source.get('highDefinition');

            return json;
        },
        
        initialize: function () {
            //  TODO: Can this just be combined into parse with a simple new Source?
            console.log("playlistItem initialize being called");
            var source = this.get('source');

            //  Need to convert source object to Backbone.Model
            if (!(source instanceof Backbone.Model)) {
                source = new Source(source);
                //  Silent because source is just being properly set.
                this.set('source', source, { silent: true });
            }

        }
    });

    //  TODO: Move this into initialize or something instead of wrapping if possible?
    //  Public exposure of a constructor for building new PlaylistItem objects.
    return function (config) {

        //  Default the PlaylistItem's title to the Source's title, but allow overriding.
        if (config && config.title === undefined || config.title === '') {
            //  Support data coming straight from the server and being used to initialize
            //  TODO: I can't use instanceof Backbone.Model here because if the Source came from the foreground and this is evaluated in the background
            //  instanceof Backbone.Model returns false even if the Source really is a Backbone.Model.
            //config.title = config.source instanceof Backbone.Model ? config.source.get('title') : config.title;
            config.title = config.source.get ? config.source.get('title') : config.source.title;
        }

        var playlistItem = new PlaylistItem(config);
        return playlistItem;
    };
});