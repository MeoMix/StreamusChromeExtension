'use strict';
import {Model} from 'backbone';
import YouTubeV3API from 'background/model/youTubeV3API';

// Ensure that the network is not flooded with requests when issuing several getRelatedVideos requests.
var RelatedVideosManager = Model.extend({
  defaults: function() {
    return {
      currentRequestCount: 0,
      maxRequestCount: 5,
      requestOptionsQueue: []
    };
  },

  // When a video comes from the server it won't have its related videos, so need to fetch and populate.
  // Expects options: { videoId: string, success: function, error: function }
  getRelatedVideos: function(options) {
    if (this._canRequest()) {
      this._incrementRequestCount();

      YouTubeV3API.getRelatedVideos({
        videoId: options.videoId,
        success: this._onGetRelatedVideosSuccess.bind(this, options.success),
        error: options.error
      });
    } else {
      this.get('requestOptionsQueue').push(options);
    }
  },

  _onGetRelatedVideosSuccess: function(callback, relatedVideos) {
    this._decrementRequestCount();
    callback(relatedVideos);
    this._checkRequestQueue();
  },

  // If more requests are queued up when a request finishes, run the next request in the queue.
  _checkRequestQueue: function() {
    var requestOptions = this.get('requestOptionsQueue').shift();

    if (!_.isUndefined(requestOptions)) {
      this.getRelatedVideos(requestOptions);
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

export default RelatedVideosManager;