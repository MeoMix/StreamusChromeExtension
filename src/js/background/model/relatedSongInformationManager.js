define([
    'common/model/youTubeV3API'
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

            if (!this.canRequest()) {
                this.get('requestQueue').push(options);
                return;
            }

            this.set('concurrentRequestCount', this.get('concurrentRequestCount') + 1);

            YouTubeV3API.getRelatedSongInformationList({
                songId: options.songId,
                success: function(songInformationList) {

                    //var playableEntryList = [];
                    //var unplayableEntryList = [];

                    //  Sort all of the related songs returned into two piles - playable and unplayable.
                    //_.each(result.feed.entry, function(entry) {

                    //    var isValid = YouTubeV2API.validateEntry(entry);

                    //    if (isValid) {
                    //        playableEntryList.push(entry);
                    //    } else {
                    //        unplayableEntryList.push(entry);
                    //    }

                    //});

                    //  Search YouTube by title and replace unplayable songs.
                    //  Since this is an asynchronous action -- need to wait for all of the events to finish before we have a fully complete list.
                    //var deferredEvents = _.map(unplayableEntryList, function(entry) {
                    //    return YouTubeV3API.getSongInformationByTitle({
                    //        title: entry.title.$t,
                    //        success: function(playableEntry) {
                    //            //  Successfully found a replacement
                    //            playableEntryList.push(playableEntry);
                    //        },
                    //        error: function(error) {
                    //            console.error("There was an error find a playable entry for:" + entry.title.$t, error);
                    //        }
                    //    });
                    //});

                    //  Wait for all of the getSongInformationByTitle AJAX requests to complete.
                    //$.when.apply($, deferredEvents).done(function() {
                        this.set('concurrentRequestCount', this.get('concurrentRequestCount') - 1);
                        //options.success(playableEntryList);
                        options.success(songInformationList);

                        var requestQueue = this.get('requestQueue');

                        //  If more requests are queued up when this request finishes -- run another.
                        if (requestQueue.length > 0) {
                            var request = requestQueue.shift();
                            this.getRelatedSongInformation(request);
                        }
                    //}.bind(this));

                }.bind(this),
                error: options.error
            });
        },

        //  Only allow requests up to maxConcurrentRequests -- otherwise return false and queue.
        canRequest: function() {
            return this.get('concurrentRequestCount') < this.get('maxConcurrentRequests');
        }
    });

    return new RelatedSongInformationManager();
});