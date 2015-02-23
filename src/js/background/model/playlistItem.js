define(function (require) {
    'use strict';

    var Song = require('background/model/song');
    var ListItemType = require('common/enum/listItemType');
    
    var PlaylistItem = Backbone.Model.extend({
        defaults: {
            id: null,
            playlistId: null,
            sequence: -1,
            title: '',
            selected: false,
            firstSelected: false,
            song: null,
            listItemType: ListItemType.PlaylistItem
        },
        
        parse: function (playlistItemDto) {
            //  Patch requests do not return information.
            if (!_.isUndefined(playlistItemDto)) {
                //  Convert C# Guid.Empty into BackboneJS null
                for (var key in playlistItemDto) {
                    if (playlistItemDto.hasOwnProperty(key) && playlistItemDto[key] === '00000000-0000-0000-0000-000000000000') {
                        playlistItemDto[key] = null;
                    }
                }

                // Take json of song and set into model. Delete to prevent overriding on return of data object.
                this.get('song').set(playlistItemDto.song);
                delete playlistItemDto.song;
            }

            return playlistItemDto;
        },
        
        toJSON: function () {
            //  Backbone Model's toJSON doesn't automatically send cid across, but I want it for re-mapping collections after server saves.
            var json = Backbone.Model.prototype.toJSON.apply(this, arguments);
            json.cid = this.cid;
            return json;
        },

        initialize: function () {
            this._ensureSongModel();
        },
        
        //  Return the attributes needed to sync this object across chrome.storage.sync
        getSyncAttributes: function() {
            return {
                title: this.get('title'),
                sequence: this.get('sequence'),
                song: this.get('song').getSyncAttributes()
            };
        },
        
        _ensureSongModel: function() {
            var song = this.get('song');

            //  Need to convert song object to Backbone.Model
            if (!(song instanceof Backbone.Model)) {
                //  Silent because song is just being properly set.
                this.set('song', new Song(song), { silent: true });
            }
        }
    });

    return PlaylistItem;
});