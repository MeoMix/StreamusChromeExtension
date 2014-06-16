//  When clicked -- goes to the next StreamItem. Can potentially go from the end of the list to the front if repeat playlist is toggled on
define([
    'background/model/song',
    'background/model/relatedSongInformationManager'
], function (Song, RelatedSongInformationManager) {
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
                relatedSongInformation: [],
                sequence: -1
            };
        },
        
        initialize: function () {
            var song = this.get('song');

            //  Need to convert song object to Backbone.Model
            if (!(song instanceof Backbone.Model)) {
                song = new Song(song);
                //  Silent because song is just being properly set.
                this.set('song', song, { silent: true });
            }

            //  Whenever a streamItem is activated it is considered playedRecently.
            //  This will reset when all streamItems in the stream have been played recently.
            this.on('change:active', function (model, active) {
                this.save({ active: active });

                if (active) {
                    this.set('playedRecently', true);
                }
            });

            this.on('change:sequence', function (model, sequence) {
                this.save({ sequence: sequence });
            });

            RelatedSongInformationManager.getRelatedSongInformation({
                songId: this.get('song').get('id'),
                success: function (relatedSongInformation) {
                    this.set('relatedSongInformation', relatedSongInformation);
                }.bind(this)
            });

        }
    });

    return StreamItem;
});