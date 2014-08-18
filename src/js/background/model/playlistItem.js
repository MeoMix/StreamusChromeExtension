define([
    'background/enum/syncActionType',
    'background/model/settings',
    'background/model/song',
    'common/enum/listItemType'
], function (SyncActionType, Settings, Song, ListItemType) {
    'use strict';
    
    var PlaylistItem = Backbone.Model.extend({
        defaults: function() {
            return {
                id: null,
                playlistId: null,
                sequence: -1,
                title: '',
                selected: false,
                firstSelected: false,
                song: null
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

            // Take json of song and set into model. Delete to prevent overriding on return of data object.
            this.get('song').set(playlistItemDto.song);
            delete playlistItemDto.song;

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
            this._ensureTitle();
            
            this.on('change:sequence', this._onChangeSequence);
        },
        
        _ensureSongModel: function() {
            var song = this.get('song');

            //  Need to convert song object to Backbone.Model
            if (!(song instanceof Backbone.Model)) {
                //  Silent because song is just being properly set.
                this.set('song', new Song(song), { silent: true });
            }
        },
        
        //  Ensure that the Song's title is propagated up to its parent when unset. 
        //  PlaylistItem's title could be edited so only copy when its blank.
        _ensureTitle: function() {
            if (this.get('title') === '') {
                this.set('title', this.get('song').get('title'));
            }
        },
        
        _onChangeSequence: function (model, sequence) {
            Backbone.Wreqr.radio.channel('sync').vent.trigger('sync', {
                listItemType: ListItemType.PlaylistItem,
                syncActionType: SyncActionType.PropertyChange,
                property: 'sequence',
                model: model
            });
        }
    });

    return PlaylistItem;
});