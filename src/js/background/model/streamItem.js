//  When clicked -- goes to the next StreamItem. Can potentially go from the end of the list to the front if repeat playlist is toggled on
define([
    'background/model/song',
    'background/model/relatedSongInformationManager'
], function (Song, RelatedSongInformationManager) {
    'use strict';
   
    var StreamItem = Backbone.Model.extend({
        defaults: function () {
            return {
                id: _.uniqueId('streamItem_'),
                song: null,
                title: '',
                //  Used to weight randomness in shuffle. Resets to false when all in collection are set to true.
                playedRecently: false,
                active: false,
                selected: false,
                firstSelected: false,
                relatedSongInformation: []
            };
        },

        // New instances of this model will have a 'dud' sync function
        sync: function () { return false; },
        
        initialize: function () {
            //  Whenever a streamItem is activated it is considered playedRecently.
            //  This will reset when all streamItems in the stream have been played recently.
            this.on('change:active', function (model, active) {
                if (active) {
                    this.set('playedRecently', true);
                }
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