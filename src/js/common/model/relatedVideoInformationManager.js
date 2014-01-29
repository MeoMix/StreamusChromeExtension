define([
    'common/model/youTubeV2API'
], function(YouTubeV2API) {
    'use strict';

    //  Ensures that I don't flood the network with requests for related
    //  video information whenever creating a large amount of stream items.
    var RelatedVideoInformationManager = Backbone.Model.extend({
        defaults: function() {
            return {
                concurrentRequestCount: 0,
                //  TODO: 5 is a magic number. It seems OK, but maybe I could make an estimate based on client information.
                maxConcurrentRequests: 5,
                //  If currentRequests would exceed maxConcurrentRequests, queue the request instead.
                requestQueue: []
            };
        },

        //  When a video comes from the server it won't have its related videos, so need to fetch and populate.
        //  Expects options: { videoId: string, success: function, error: function }
        getRelatedVideoInformation: function(options) {

            if (!this.canRequest()) {
                this.get('requestQueue').push(options);
                return;
            }

            this.set('concurrentRequestCount', this.get('concurrentRequestCount') + 1);

            YouTubeV2API.sendV2ApiRequest({
                url: 'https://gdata.youtube.com/feeds/api/videos/' + options.videoId + '/related',
                data: {
                    category: 'Music',
                    fields: YouTubeV2API.get('videoListInformationField'),
                    //  Don't really need that many suggested videos, take 10.
                    //  TODO: I think I actually only want 5, maybe 4, but need to play with it...
                    'max-results': 10
                },
                success: function(result) {

                    var playableEntryList = [];
                    var unplayableEntryList = [];

                    //  Sort all of the related videos returned into two piles - playable and unplayable.
                    _.each(result.feed.entry, function(entry) {

                        var isValid = YouTubeV2API.validateEntry(entry);

                        if (isValid) {
                            playableEntryList.push(entry);
                        } else {
                            unplayableEntryList.push(entry);
                        }

                    });

                    //  Search YouTube by title and replace unplayable videos.
                    //  Since this is an asynchronous action -- need to wait for all of the events to finish before we have a fully complete list.
                    var deferredEvents = _.map(unplayableEntryList, function(entry) {
                        return YouTubeV2API.findPlayableByTitle({
                            title: entry.title.$t,
                            success: function(playableEntry) {
                                //  Successfully found a replacement playable video
                                playableEntryList.push(playableEntry);
                            },
                            error: function(error) {
                                console.error("There was an error find a playable entry for:" + entry.title.$t, error);
                            }
                        });
                    });

                    //  Wait for all of the findPlayableByTitle AJAX requests to complete.
                    $.when.apply($, deferredEvents).done(function() {
                        this.set('concurrentRequestCount', this.get('concurrentRequestCount') - 1);
                        options.success(playableEntryList);

                        var requestQueue = this.get('requestQueue');

                        //  If more requests are queued up when this request finishes -- run another.
                        if (requestQueue.length > 0) {
                            var request = requestQueue.shift();
                            this.getRelatedVideoInformation(request);
                        }
                    }.bind(this));

                }.bind(this),
                error: options.error
            });
        },

        //  Only allow requests up to maxConcurrentRequests -- otherwise return false and queue.
        canRequest: function() {
            return this.get('concurrentRequestCount') < this.get('maxConcurrentRequests');
        }
    });

    return new RelatedVideoInformationManager();
});