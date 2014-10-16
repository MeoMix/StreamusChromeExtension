define([
    'background/model/youTubePlayerAPI',
    'common/enum/youTubePlayerError'
], function (YouTubePlayerAPI, YouTubePlayerError) {
    'use strict';

    //  This is the actual YouTube Player API widget housed within the iframe.
    var youTubePlayerWidget = null;
    
    //  This value is 1 because it is displayed visually.
    //  'Load attempt: 0' does not make sense to non-programmers.
    var _initialLoadAttempt = 1;

    var YouTubePlayer = Backbone.Model.extend({
        defaults: function() {
            return {
                ready: false,
                loading: false,
                api: new YouTubePlayerAPI(),
                iframeId: '',
                //  Match on my specific iframe or else else this logic can leak into outside webpages and corrupt other YouTube embeds.
                youTubeEmbedUrl: '*://*.youtube.com/embed/?enablejsapi=1&origin=chrome-extension:\\\\' + Streamus.extensionId,
                //  Wait 6 seconds before each load attempt so that total time elapsed is one minute
                maxLoadAttempts: 10,
                loadAttemptDelay: 6000,
                loadAttempt: _initialLoadAttempt,
                loadAttemptInterval: null
            };
        },
        
        initialize: function () {
            this.listenTo(this.get('api'), 'change:ready', this._onApiChangeReady);
            this.listenTo(Streamus.channels.foreground.vent, 'started', this._onForegroundStarted);
            this.on('change:loading', this._onChangeLoading);
        },
        
        //  Preload is used to indicate that an attempt to load YouTube's API is hopefully going to come soon. However, if the iframe
        //  holding YouTube's API fails to load then load will not be called. If the iframe does load successfully then load will be called.
        preload: function () {
            if (!this.get('loading')) {
                //  Ensure the widget is null for debugging purposes. 
                //  Being able to tell the difference between a widget API method failing and the widget itself not being ready is important.
                youTubePlayerWidget = null;
                //  It is important to set loading after ready because having the player be both 'loading' and 'ready' does not make sense.
                this.set('ready', false);
                this.set('loading', true);
            }
        },
        
        //  Loading a widget requires the widget's API be ready first. Ensure that the API is loaded
        //  otherwise defer loading a widget until the API is ready.
        load: function () {
            var api = this.get('api');
            api.get('ready') ? this._loadWidget() : api.load();
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
            //  The seekTo method accepts an "allowSeekAhead" boolean. I never provide it because
            //  I have no need to aggressively load a new video stream.
            //  https://developers.google.com/youtube/js_api_reference#seekTo
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

        //  The variable is called suggestedQuality because the widget may not have be able to fulfill the request.
        //  If it cannot, it will set its quality to the level most near suggested quality.
        setPlaybackQuality: function (suggestedQuality) {
            youTubePlayerWidget.setPlaybackQuality(suggestedQuality);
        },

        loadVideoById: function (videoOptions) {
            youTubePlayerWidget.loadVideoById(videoOptions);
        },

        cueVideoById: function (videoOptions) {
            youTubePlayerWidget.cueVideoById(videoOptions);
        },

        _loadWidget: function () {
            //  YouTube's API creates the window.YT object with which widgets can be created.
            //  https://developers.google.com/youtube/iframe_api_reference#Loading_a_Video_Player
            youTubePlayerWidget = new window.YT.Player(this.get('iframeId'), {
                events: {
                    onReady: this._onYouTubePlayerReady.bind(this),
                    onStateChange: this._onYouTubePlayerStateChange.bind(this),
                    onError: this._onYouTubePlayerError.bind(this)
                }
            });
        },

        _onYouTubePlayerReady: function () {
            //  It's important to set ready to true before loading to false otherwise it looks like YouTubePlayer failed to load properly.
            this.set('ready', true);
            this.set('loading', false);
        },

        _onYouTubePlayerStateChange: function (state) {
            //  TODO: It might be nice to store 'state' on the YouTubePlayer as well as on Player for debugging purposes.
            //  Pass 'this' as the first parameter to match the event signature of a Backbone.Model change event.
            this.trigger('change:state', this, state.data);
        },

        //  Emit errors so the foreground so can notify the user.
        _onYouTubePlayerError: function (error) {
            //  If the error is really bad then attempt to recover rather than reflecting the error throughout the program.
            if (error.data === YouTubePlayerError.ReallyBad) {
                this.preload();
            } else {
                this.trigger('youTubeError', error.data);
            }
        },

        _onApiChangeReady: function (model, ready) {
            if (ready) {
                this._loadWidget();
            }
        },
        
        _onChangeLoading: function (model, loading) {
            this.set('loadAttempt', _initialLoadAttempt);
            var loadAttemptInterval = null;

            //  Consume an attempt every 6 seconds while loading.
            if (loading) {
                loadAttemptInterval = setInterval(this._onLoadAttemptDelayExceeded.bind(this), this.get('loadAttemptDelay'));
            } else {
                clearInterval(this.get('loadAttemptInterval'));
            }
            
            this.set('loadAttemptInterval', loadAttemptInterval);
        },
        
        _onLoadAttemptDelayExceeded: function () {
            var loadAttempt = this.get('loadAttempt');
                    
            if (loadAttempt === this.get('maxLoadAttempts')) {
                this.set('loading', false);
            } else {
                this.set('loadAttempt', loadAttempt + 1);
            }
        },
        
        //  Streamus could have disconnected from the API and failed to recover automatically.
        //  A good time to try recovering again is when the user is interacting the UI.
        _onForegroundStarted: function() {
            if (!this.get('ready')) {
                this.preload();
            }
        }
    });

    return YouTubePlayer;
});