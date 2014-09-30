define([
    'background/model/youTubePlayerAPI'
], function (YouTubePlayerAPI) {
    'use strict';

    var YouTubePlayer = Backbone.Model.extend({
        loadAPI: function () {
            var youTubePlayerAPI = new YouTubePlayerAPI();
            this.listenToOnce(youTubePlayerAPI, 'change:ready', this._onYouTubePlayerApiReady);
            youTubePlayerAPI.load();
        }
    });

    return new YouTubePlayer();
})