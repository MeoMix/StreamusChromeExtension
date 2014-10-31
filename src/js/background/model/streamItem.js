define([
    'background/collection/songs',
    'background/model/song',
    'common/enum/listItemType'
], function (Songs, Song, ListItemType) {
    'use strict';
   
    var StreamItem = Backbone.Model.extend({
        defaults: function () {
            return {
                id: null,
                song: null,
                title: '',
                //  Used to weight randomness in shuffle. Resets to false when all in collection are set to true.
                playedRecently: false,
                active: false,
                selected: false,
                firstSelected: false,
                relatedSongs: new Songs(),
                sequence: -1,
                listItemType: ListItemType.StreamItem
            };
        },
        
        //  Don't want to save everything to localStorage -- only variables which need to be persisted.
        blacklist: ['selected', 'firstSelected'],
        toJSON: function () {
            return this.omit(this.blacklist);
        },
        
        initialize: function () {
            this._ensureSongModel();
            this._ensureRelatedSongsCollection();
            this.on('change:active', this._onChangeActive);
        },

        _ensureSongModel: function() {
            var song = this.get('song');

            //  Need to convert song object to Backbone.Model
            if (!(song instanceof Backbone.Model)) {
                //  Silent because song is just being properly set.
                this.set('song', new Song(song), { silent: true });
            }
        },
        
        _ensureRelatedSongsCollection: function () {
            var relatedSongs = this.get('relatedSongs');

            //  Need to convert relatedSongs array to Backbone.Collection
            if (!(relatedSongs instanceof Backbone.Collection)) {
                //  Silent because relatedSongs is just being properly set.
                this.set('relatedSongs', new Songs(relatedSongs), {
                    silent: true
                });
            }
        },
        
        //  Whenever a streamItem is activated it is considered playedRecently.
        //  This will reset when all streamItems in the stream have been played recently.
        _onChangeActive: function(model, active) {
            if (active && !this.get('playedRecently')) {
                this.save({ playedRecently: true });
            }
        }
    });

    return StreamItem;
});