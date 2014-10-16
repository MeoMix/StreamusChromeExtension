define([
    'background/model/youTubeV3API'
], function (YouTubeV3API) {
    'use strict';

    //  Ensures that I don't flood the network with requests for related information whenever creating a large amount of stream items.
    var RelatedSongInformationManager = Backbone.Model.extend({
        defaults: function() {
            return {
                concurrentRequestCount: 0,
                maxConcurrentRequests: 5,
                //  If currentRequests would exceed maxConcurrentRequests, queue the request instead.
                requestQueue: []
            };
        },

        //  When a song comes from the server it won't have its related songs, so need to fetch and populate.
        //  Expects options: { songId: string, success: function, error: function }
        getRelatedSongInformation: function(options) {
            if (!this._canRequest()) {
                this.get('requestQueue').push(options);
                return;
            }

            this.set('concurrentRequestCount', this.get('concurrentRequestCount') + 1);

            YouTubeV3API.getRelatedSongInformationList({
                songId: options.songId,
                success: function(songInformationList) {
                    //  Wait for all of the getSongInformationByTitle AJAX requests to complete.
                    this.set('concurrentRequestCount', this.get('concurrentRequestCount') - 1);
                    options.success(songInformationList);

                    var requestQueue = this.get('requestQueue');

                    //  If more requests are queued up when this request finishes -- run another.
                    if (requestQueue.length > 0) {
                        var request = requestQueue.shift();
                        this.getRelatedSongInformation(request);
                    }
                }.bind(this),
                error: options.error
            });
        },

        //  Only allow requests up to maxConcurrentRequests -- otherwise return false and queue.
        _canRequest: function() {
            return this.get('concurrentRequestCount') < this.get('maxConcurrentRequests');
        }
    });

    return new RelatedSongInformationManager();
});