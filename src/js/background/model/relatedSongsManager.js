define(function(require) {
    'use strict';

    var YouTubeV3API = require('background/model/youTubeV3API');

    //  Ensures that the network is not flooded with AJAX requests when issuing a bulk amount of getRelatedSongs requests.
    //  This can most commonly happen when inserting a playlist into the stream as each stream item needs to retrieve its related songs.
    var RelatedSongsManager = Backbone.Model.extend({
        defaults: function() {
            return {
                currentRequestCount: 0,
                maxRequestCount: 5,
                requestOptionsQueue: []
            };
        },

        //  When a song comes from the server it won't have its related songs, so need to fetch and populate.
        //  Expects options: { songId: string, success: function, error: function }
        getRelatedSongs: function(options) {
            if (this._canRequest()) {
                this._incrementRequestCount();

                YouTubeV3API.getRelatedSongs({
                    songId: options.songId,
                    success: this._onGetRelatedSongsSuccess.bind(this, options.success),
                    error: options.error
                });
            } else {
                this.get('requestOptionsQueue').push(options);
            }
        },

        _onGetRelatedSongsSuccess: function(callback, relatedSongs) {
            this._decrementRequestCount();
            callback(relatedSongs);
            this._checkRequestQueue();
        },

        //  If more requests are queued up when a request finishes, run the next request in the queue.
        _checkRequestQueue: function() {
            var requestOptions = this.get('requestOptionsQueue').shift();

            if (!_.isUndefined(requestOptions)) {
                this.getRelatedSongs(requestOptions);
            }
        },

        _incrementRequestCount: function() {
            this.set('currentRequestCount', this.get('currentRequestCount') + 1);
        },

        _decrementRequestCount: function() {
            this.set('currentRequestCount', this.get('currentRequestCount') - 1);
        },

        _canRequest: function() {
            return this.get('currentRequestCount') < this.get('maxRequestCount');
        }
    });

    return RelatedSongsManager;
});