define([
	'background/view/youTubePlayerView'
], function (YouTubePlayerView) {
    'use strict';

    var YouTubePlayerRegion = Marionette.Region.extend({
        youTubePlayer: null,
        debugManager: null,

        initialize: function (options) {
            this.youTubePlayer = options.youTubePlayer;
            this.debugManager = options.debugManager;
            
            this.listenTo(Streamus.channels.backgroundArea.vent, 'shown', this._onBackgroundAreaShown);
            this.listenTo(this.youTubePlayer, 'change:loading', this._onYouTubePlayerChangeLoading);
            this.listenTo(this.youTubePlayer, 'change:currentLoadAttempt', this._onYouTubePlayerChangeCurrentLoadAttempt);
        },
        
        _onBackgroundAreaShown: function () {
            if (this.youTubePlayer.get('loading')) {
                this._showYouTubePlayerView();
            } else {
                this.youTubePlayer.preload();
            }
        },

        _showYouTubePlayerView: function () {
            var youTubePlayerView = new YouTubePlayerView({
                model: this.youTubePlayer,
                debugManager: this.debugManager
            });
            
            this.show(youTubePlayerView);
        },

        _onYouTubePlayerChangeLoading: function (model, loading) {
            if (loading) {
                this._showYouTubePlayerView();
            }
        },

        _onYouTubePlayerChangeCurrentLoadAttempt: function (model) {
            if (model.get('loading')) {
                this._showYouTubePlayerView();
            }
        }
    });

    return YouTubePlayerRegion;
});