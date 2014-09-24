define([
    'background/model/youTubePlayerAPI',
    'background/model/settings',
    'common/enum/playerState'
], function (YouTubePlayerAPI, Settings, PlayerState) {
    'use strict';

    //  This is the actual YouTube Player API object housed within the iframe.
    var youTubePlayer = null;

    var YouTubePlayer = Backbone.Model.extend({
        defaults: {
            //  Returns the elapsed time of the currently loaded song. Returns 0 if no song is playing
            currentTime: 0,
            //  API will fire a 'ready' event after initialization which indicates the player can now respond accept commands
            ready: false,
            state: PlayerState.Unstarted,
            //  This will be set after the player is ready and can communicate its true value.
            //  Default to 50 because having the music on and audible, but not blasting, seems like the best default if we fail for some reason.
            volume: 50,
            //  This will be set after the player is ready and can communicate its true value.
            muted: false,
            loadedSongId: '',
            refreshPausedSongTimeout: null
        },
        
        //  Initialize the player by creating a YouTube Player IFrame hosting an HTML5 player
        initialize: function () {
            this.on('change:volume', this._onChangeVolume);
            this.on('change:muted', this._onChangeMuted);
            this.on('change:state', this._onChangeState);
            this.listenTo(Settings, 'change:youTubeSuggestedQuality', this._onChangeSuggestedQuality);
            chrome.runtime.onConnect.addListener(this._onRuntimeConnect.bind(this));

            this._loadYouTubePlayerApi();
        },
        
        //  Public method which is able to be called before the YouTube Player API is fully ready.
        //  cue's a song (pauses it when it is ready)
        cueSongById: function (songId, startSeconds) {
            if (this.get('ready')) {
                this._cueSongById(songId, startSeconds);
            } else {
                this.once('change:ready', function () {
                    this._cueSongById(songId, startSeconds);
                });
            }
        },

        //  Public method which is able to be called before the YouTube Player API is fully ready.
        //  Loads a song (plays it when it is ready)
        loadSongById: function (songId, startSeconds) {
            if (this.get('ready')) {
                this._loadSongById(songId, startSeconds);
            } else {
                this.once('change:ready', function() {
                    this._loadSongById(songId, startSeconds);
                });
            }
        },

        isPlaying: function () {
            return this.get('state') === PlayerState.Playing;
        },
        
        mute: function () {
            this.set('muted', true);
            youTubePlayer.mute();
        },
        
        unMute: function () {
            this.set('muted', false);
            youTubePlayer.unMute();
        },

        stop: function () {
            this.set('state', PlayerState.Unstarted);
            youTubePlayer.stopVideo();
            this.set('loadedSongId', '');

            //  Stop is only called when there's no other items to queue up - set time back to 0 since
            //  a new song won't queue up and set its time.
            this.set('currentTime', 0);
        },

        pause: function () {
            youTubePlayer.pauseVideo();
        },
            
        play: function () {
            if (!this.isPlaying()) {
                this.set('state', PlayerState.Buffering);
                youTubePlayer.playVideo();
            }
        },
        
        //  Call play once Player indicates the loadedSongId has changed
        playOnceSongChanges: function () {
            this.once('change:loadedSongId', function() {
                //  TODO: Why is setTimeout needed here? Otherwise play doesn't work if Player is paused?
                setTimeout(this.play.bind(this));
            });
        },

        seekTo: _.debounce(function (timeInSeconds) {
            var state = this.get('state');
            
            if (state === PlayerState.Unstarted || state === PlayerState.SongCued) {
                this.cueSongById(this.get('loadedSongId'), timeInSeconds);
                this.set('currentTime', timeInSeconds);
            } else {
                //  The true paramater allows the youTubePlayer to seek ahead past what is buffered.
                youTubePlayer.seekTo(timeInSeconds, true);
            }
        }, 100),
        
        //  Attempt to set playback quality to suggestedQuality or highest possible.
        _onChangeSuggestedQuality: function (model, suggestedQuality) {
            youTubePlayer.setPlaybackQuality(suggestedQuality);
        },

        _cueSongById: function (songId, startSeconds) {
            //  Helps for keeping things in sync when the same song reloads.
            if (this.get('loadedSongId') === songId) {
                this.trigger('change:loadedSongId');
            }

            youTubePlayer.cueVideoById({
                videoId: songId,
                startSeconds: startSeconds || 0,
                suggestedQuality: Settings.get('youTubeSuggestedQuality')
            });

            this.set('loadedSongId', songId);

            //  It's helpful to keep currentTime set here because the progress bar in foreground might be visually set,
            //  but until the song actually loads -- current time isn't set.
            this.set('currentTime', startSeconds || 0);
        },
        
        _loadSongById: function (songId, startSeconds) {
            //  Helps for keeping things in sync when the same song reloads.
            if (this.get('loadedSongId') === songId) {
                this.trigger('change:loadedSongId');
            }

            this.set('state', PlayerState.Buffering);

            youTubePlayer.loadVideoById({
                videoId: songId,
                startSeconds: startSeconds || 0,
                suggestedQuality: Settings.get('youTubeSuggestedQuality')
            });

            this.set('loadedSongId', songId);
        },
        
        //  Update the volume whenever the UI modifies the volume property.
        _onChangeVolume: function (model, volume) {
            this.set('muted', false);
            //  We want to update the youtube player's volume no matter what because it persists between browser sessions
            //  thanks to YouTube saving it -- so should keep it always sync'ed.
            youTubePlayer.setVolume(volume);
        },
        
        _onChangeMuted: function(model, muted) {
            muted ? youTubePlayer.mute() : youTubePlayer.unMute();
        },
        
        _onChangeState: function (model, state) {
            var refreshPausedSongTimeout = this.get('refreshPausedSongTimeout');
            clearTimeout(refreshPausedSongTimeout);

            if (state === PlayerState.Paused) {
                //  TODO: Maybe I need to restart the whole API after 8 hours because HTTPS times out?
                //  Start a long running timer when the player becomes paused. This is because YouTube
                //  will expire after ~8+ hours of being loaded. This only happens if the player is paused.
                var eightHours = 28800000;
                refreshPausedSongTimeout = setTimeout(this._reloadSong.bind(this), eightHours);
            }
            
            this.set('refreshPausedSongTimeout', refreshPausedSongTimeout);
        },
        
        _reloadSong: function() {
            this.cueSongById(this.get('loadedSongId'), this.get('currentTime'));
        },
        
        _onRuntimeConnect: function (port) {
            if (port.name === 'youTubeIFrameConnectRequest') {
                port.onMessage.addListener(this._onYouTubeIFrameMessage.bind(this));
            }
        },
        
        _onYouTubeIFrameMessage: function(message) {
            //  It's better to be told when time updates rather than poll YouTube's API for the currentTime.
            if (!_.isUndefined(message.currentTime)) {
                this.set('currentTime', message.currentTime);
            }

            //  YouTube's API for seeking/buffering doesn't fire events reliably.
            //  Listen directly to the element for more responsive results.
            if (!_.isUndefined(message.seeking)) {
                if (message.seeking) {
                    if (this.get('state') === PlayerState.Playing) {
                        this.set('state', PlayerState.Buffering);
                    }
                } else {
                    if (this.get('state') === PlayerState.Buffering) {
                        this.set('state', PlayerState.Playing);
                    }
                }
            }
        },
        
        _loadYouTubePlayerApi: function() {
            var youTubePlayerAPI = new YouTubePlayerAPI();
            this.listenTo(youTubePlayerAPI, 'change:ready', this._onYouTubePlayerApiReady);
            youTubePlayerAPI.load();
        },
        
        _onYouTubePlayerApiReady: function() {
            //  Injected YouTube code creates a global YT object with which a 'YouTube Player' object can be created.
            //  https://developers.google.com/youtube/iframe_api_reference#Loading_a_Video_Player
            youTubePlayer = new window.YT.Player('youtube-player', {
                events: {
                    'onReady': this._onYouTubePlayerReady.bind(this),
                    'onStateChange': this._onYouTubePlayerStateChange.bind(this),
                    'onError': this._onYouTubePlayerError.bind(this)
                }
            });

            $('#youtube-player').attr('src', 'https://www.youtube.com/embed/?enablejsapi=1&origin=chrome-extension:\\\\jbnkffmindojffecdhbbmekbmkkfpmjd');
        },
        
        _onYouTubePlayerReady: function() {
            this.set('muted', youTubePlayer.isMuted());
            this.set('volume', youTubePlayer.getVolume());
            this.pause();
            this.set('ready', true);
        },
        
        _onYouTubePlayerStateChange: function(state) {
            this.set('state', state.data);
        },
        
        _onYouTubePlayerError: function (error) {
            //  Push the error to the foreground so it can be displayed to the user.
            this.trigger('error', error.data);
            //  YouTube's API does not emit an error if the cue'd video has already emitted an error.
            //  So, when put into an error state, re-cue the video so that subsequent user interactions will continue to show the error.
            youTubePlayer.cueVideoById({
                videoId: this.get('loadedSongId')
            });
        }
    });

    //  Exposed globally so that the foreground can access the same instance through chrome.extension.getBackgroundPage()
    window.YouTubePlayer = new YouTubePlayer();
    return window.YouTubePlayer;
});