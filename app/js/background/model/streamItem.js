//  When clicked -- goes to the next video. Can potentially go from the end of the list to the front if repeat playlist is toggled on
define([
    'video'
], function (Video) {
    'use strict';
   
    var StreamItem = Backbone.Model.extend({
        defaults: function () {
            return {
                video: null,
                title: chrome.i18n.getMessage("emptyStreamItem"),
                //  Used to weight randomness in shuffle. Resets to false when all in collection are set to true.
                playedRecently: false,
                selected: false,
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
            
            var self = this;
            //  Whenever a streamItem is selected it is considered playedRecently.
            //  This will reset when all streamItems in the stream have been played recently.
            this.on('change:selected', function() {

                if (self.get('selected')) {
                    self.set('playedRecently', true);
                }

            });

        }
    });

    return StreamItem;
});