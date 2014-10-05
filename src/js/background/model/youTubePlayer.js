define([
    'background/model/youTubePlayerAPI'
], function (YouTubePlayerAPI) {
    'use strict';

    //  This is the actual YouTube Player API widget housed within the iframe.
    var youTubePlayerWidget = null;

    var YouTubePlayer = Backbone.Model.extend({
        defaults: {
            ready: false,
            api: new YouTubePlayerAPI(),
            apiReady: false,
            iframeId: '',
            reloadInterval: null,
            maxReloadTries: 2,
            remainingReloadTries: 2,
            loadFailed: false,
            //  Match on my specific iframe or else else this logic can leak into outside webpages and corrupt other YouTube embeds.
            youTubeEmbedUrl: '*://*.youtube.com/embed/?enablejsapi=1&origin=chrome-extension:\\\\jbnkffmindojffecdhbbmekbmkkfpmjd'
        },
        
        initialize: function () {
            this.listenTo(this.get('api'), 'change:ready', this._onYouTubePlayerApiChangeReady);
        },

        load: function () {
            if (this.get('apiReady')) {
                this._load();
            } else {
                this.get('api').load();
                this.once('change:apiReady', this._load);
            }
        },

        stop: function () {
            youTubePlayerWidget.stopVideo();
        },

        pause: function () {
            youTubePlayerWidget.pauseVideo();
        },

        play: function () {
            youTubePlayerWidget.playVideo();
        },

        seekTo: function (timeInSeconds) {
            //  The true paramater allows the youTubePlayer to seek ahead past what is buffered.
            youTubePlayerWidget.seekTo(timeInSeconds);
        },

        mute: function () {
            youTubePlayerWidget.mute();
        },

        unMute: function () {
            youTubePlayerWidget.unMute();
        },

        setVolume: function (volume) {
            youTubePlayerWidget.setVolume(volume);
        },

        setPlaybackQuality: function (suggestedQuality) {
            youTubePlayerWidget.setPlaybackQuality(suggestedQuality);
        },

        loadVideoById: function (videoOptions) {
            youTubePlayerWidget.loadVideoById(videoOptions);
        },

        cueVideoById: function (videoOptions) {
            youTubePlayerWidget.cueVideoById(videoOptions);
        },
        
        _load: function () {
            youTubePlayerWidget = null;
            this.set('ready', false);

            this._setReloadInterval();
            this._tryLoadPlayerWidget();
        },

        //  Injected YouTube code creates a global YT object with which a 'YouTube Player' object can be created.
        //  https://developers.google.com/youtube/iframe_api_reference#Loading_a_Video_Player
        _tryLoadPlayerWidget: function () {
            youTubePlayerWidget = new window.YT.Player(this.get('iframeId'), {
                events: {
                    onReady: this._onYouTubePlayerReady.bind(this),
                    onStateChange: this._onYouTubePlayerStateChange.bind(this),
                    onError: this._onYouTubePlayerError.bind(this)
                }
            });
        },

        //  Loading YouTube's Player API has proven to be very unreliable. 1 in 10 chance it doesn't fire onReady even though subsequent calls work fine.
        //  So, set an interval to wait for the API to be ready and try to load a few times before giving up and assuming it legitimately isn't working.
        _setReloadInterval: function () {
            //  This line should never do anything in a production environment, but in debugging it could be possible to get here w/ an interval already set.
            this._clearReloadInterval();
            var reloadInterval = setInterval(this._reload.bind(this), 2500);
            this.set('reloadInterval', reloadInterval);
        },

        _clearReloadInterval: function () {
            var reloadInterval = this.get('reloadInterval');
            clearInterval(reloadInterval);
            this.set('reloadInterval', null);
            this.set('remainingReloadTries', this.get('maxReloadTries'));
        },

        _reload: function () {
            var remainingReloadTries = this.get('remainingReloadTries');

            if (remainingReloadTries === 0) {
                this._clearReloadInterval();
                this.set('loadFailed', true);
            } else {
                this.set('remainingReloadTries', remainingReloadTries - 1);
                this._tryLoadPlayerWidget();
            }
        },

        _onYouTubePlayerReady: function () {
            //  TODO: If .setVolume continues to throw errros after v0.151 -- use Object.observe to try and detect when widget is 100% ready.
            this._clearReloadInterval();
            this.set('ready', true);
        },

        _onYouTubePlayerStateChange: function (state) {
            this.trigger('change:state', this, state.data);
        },

        //  Emit errors so the foreground so can notify the user.
        _onYouTubePlayerError: function (error) {
            this.trigger('youTubeError', error.data);
        },

        _onYouTubePlayerApiChangeReady: function (model, ready) {
            this.set('apiReady', ready);
        }
    });

    //  Exposed globally so that the foreground can access the same instance through chrome.extension.getBackgroundPage()
    window.YouTubePlayer = new YouTubePlayer();
    return window.YouTubePlayer;
});