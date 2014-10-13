define([
	'background/model/youTubePlayer',
	'background/view/youTubePlayerView'
], function (YouTubePlayer, YouTubePlayerView) {
    'use strict';

    var YouTubePlayerRegion = Backbone.Marionette.Region.extend({
        el: '#youTubePlayerRegion',

        initialize: function () {
            this.listenTo(YouTubePlayer, 'change:loading', this._onYouTubePlayerChangeLoading);
            this.listenTo(YouTubePlayer, 'change:loadAttempt', this._onYouTubePlayerChangeLoadAttempt);

            //  TODO: This feels weird. I need to be more consistent with how I tell the player to load.
            if (YouTubePlayer.get('loading')) {
                this._showYouTubePlayerView();
            } else {
                YouTubePlayer.preload();
            }
        },

        _showYouTubePlayerView: function () {
            var youTubePlayerView = new YouTubePlayerView({
                //  TODO: It would be nice to have this not be a singleton.
                model: YouTubePlayer
            });
            
            this.show(youTubePlayerView);
        },

        _onYouTubePlayerChangeLoading: function (model, loading) {
            if (loading) {
                this._showYouTubePlayerView();
            }
        },

        _onYouTubePlayerChangeLoadAttempt: function (model) {
            if (model.get('loading')) {
                this._showYouTubePlayerView();
            }
        }
    });

    return YouTubePlayerRegion;
});