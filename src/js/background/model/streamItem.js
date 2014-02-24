//  When clicked -- goes to the next video. Can potentially go from the end of the list to the front if repeat playlist is toggled on
define([
    'background/model/video',
    'common/model/relatedVideoInformationManager'
], function (Video, RelatedVideoInformationManager) {
    'use strict';
   
    var StreamItem = Backbone.Model.extend({
        defaults: function () {
            return {
                id: _.uniqueId('streamItem_'),
                video: null,
                title: '',
                //  Used to weight randomness in shuffle. Resets to false when all in collection are set to true.
                playedRecently: false,
                active: false,
                selected: false,
                firstSelected: false,
                relatedVideoInformation: [] 
            };
        },

        // New instances of this model will have a 'dud' sync function
        sync: function () { return false; },
        
        initialize: function() {
            var video = this.get('video');

            //  Need to convert to video object to Backbone.Model
            if (!(video instanceof Backbone.Model)) {
                //  Silent because Video is just being properly set.
                this.set('video', new Video(video), { silent: true });
            }
            
            //  Whenever a streamItem is activated it is considered playedRecently.
            //  This will reset when all streamItems in the stream have been played recently.
            this.on('change:active', function (model, active) {
                if (active) {
                    this.set('playedRecently', true);
                }
            });
            
            RelatedVideoInformationManager.getRelatedVideoInformation({
                videoId: this.get('video').get('id'),
                success: function (relatedVideoInformation) {

                    if (relatedVideoInformation == null) {
                        throw "Related video information not found." + videoId;
                    }
                    
                    this.set('relatedVideoInformation', relatedVideoInformation);
                }.bind(this)
            });


        }
    });

    return StreamItem;
});