define([
	'background/view/youTubePlayerView'
], function (YouTubePlayerView) {
    'use strict';

    var YouTubePlayerRegion = Backbone.Marionette.Region.extend({
        el: '#backgroundArea-youTubePlayerRegion',

        youTubePlayer: null,

        initialize: function (options) {
            this.youTubePlayer = options.youTubePlayer;
            console.log('youTubePlayer:', this.youTubePlayer);

            this.listenTo(Streamus.channels.backgroundArea.vent, 'shown', this._onBackgroundAreaShown);
            this.listenTo(this.youTubePlayer, 'change:loading', this._onYouTubePlayerChangeLoading);
            this.listenTo(this.youTubePlayer, 'change:currentLoadAttempt', this._onYouTubePlayerChangeCurrentLoadAttempt);
        },
        
        _onBackgroundAreaShown: function () {
            //  TODO: This feels weird. I need to be more consistent with how I tell the player to load.
            if (this.youTubePlayer.get('loading')) {
                this._showYouTubePlayerView();
            } else {
                this.youTubePlayer.preload();
            }
        },

        _showYouTubePlayerView: function () {
            var youTubePlayerView = new YouTubePlayerView({
                model: this.youTubePlayer
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