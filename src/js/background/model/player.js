define([
    'background/model/youTubePlayerAPI',
    'background/model/settings',
    'enum/playerState'
], function (YouTubePlayerAPI, Settings, PlayerState) {
    'use strict';

    //  This is the actual YouTube Player API object housed within the iframe.
    var youTubePlayer = null;

    var YouTubePlayer = Backbone.Model.extend({
        defaults: {
            //  Returns the elapsed time of the currently loaded video. Returns 0 if no video is playing
            currentTime: 0,
            //  API will fire a 'ready' event after initialization which indicates the player can now respond accept commands
            ready: false,
            state: PlayerState.Unstarted,
            //  This will be set after the player is ready and can communicate its true value.
            //  Default to 50 because having the music on and audible, but not blasting, seems like the best default if we fail for some reason.
            volume: 50,
            //  This will be set after the player is ready and can communicate its true value.
            muted: false,
            loadedVideoId: ''
        },
        
        //  Initialize the player by creating a YouTube Player IFrame hosting an HTML5 player
        initialize: function () {
            var self = this;
   
            //  Update the volume whenever the UI modifies the volume property.
            this.on('change:volume', function (model, volume) {
                self.set('muted', false);
                //  We want to update the youtube player's volume no matter what because it persists between browser sessions
                //  thanks to YouTube saving it -- so should keep it always sync'ed.
                youTubePlayer.setVolume(volume);
            });

            this.on('change:muted', function (model, isMuted) {

                //  Same logic here as with the volume
                if (isMuted) {
                    youTubePlayer.mute();
                } else {
                    youTubePlayer.unMute();
                }

            });

            var refreshPausedVideoInterval = null;
            this.on('change:state', function (model, state) {

                clearInterval(refreshPausedVideoInterval);
       
                if (state === PlayerState.Paused) {

                    //  Start a long running timer when the player becomes paused. This is because a YouTube video
                    //  will expire after ~8+ hours of being loaded. This only happens if the player is paused.
                    //  Refresh videos after every 8 hours.
                    var eightHoursInMilliseconds = 28800000;

                    refreshPausedVideoInterval = setInterval(function () {
                        
                        self.cueVideoById(self.get('loadedVideoId'), self.get('currentTime'));

                    }, eightHoursInMilliseconds);

                }

            });
            
            chrome.runtime.onConnect.addListener(function(port) {

                if (port.name === 'youTubeIFrameConnectRequest') {

                    port.onMessage.addListener(function (message) {
                        
                        if (message.canvasDataURL !== undefined) {
                            self.set('canvasDataUrl', message.canvasDataURL).trigger('change:canvasDataUrl');
                        }
                        
                        //  It's better to be told when time updates rather than poll YouTube's API for the currentTime.
                        if (message.currentTime !== undefined) {
                            self.set('currentTime', message.currentTime);
                        }
                        
                        //  YouTube's API for seeking/buffering doesn't fire events reliably.
                        //  Listen directly to the video element for better results.
                        if (message.seeking !== undefined) {
                            
                            if (message.seeking) {
                                
                                if (self.get('state') === PlayerState.Playing) {
                                    self.set('state', PlayerState.Buffering);
                                }
                                
                            } else {

                                if (self.get('state') === PlayerState.Buffering) {
                                    self.set('state', PlayerState.Playing);
                                }
                                
                            }

                        }

                    });

                }

            });

            if (YouTubePlayerAPI.get('ready')) {
                setYouTubePlayer();
            }
            else {
                YouTubePlayerAPI.once('change:ready', setYouTubePlayer);
            }

            function setYouTubePlayer() {

                //  Injected YouTube code creates a global YT object with which a 'YouTube Player' object can be created.
                //  https://developers.google.com/youtube/iframe_api_reference#Loading_a_Video_Player
                youTubePlayer = new window.YT.Player('MusicHolder', {
                    width: 640,
                    height: 360,
                    events: {
                        'onReady': function () {

                            self.set('muted', youTubePlayer.isMuted());
                            self.set('volume', youTubePlayer.getVolume());
                            self.pause();

                            //  Announce that the YouTube Player is ready to go.
                            self.set('ready', true);
                        },
                        'onStateChange': function (state) {
                            self.set('state', state.data);
                        },
                        'onError': function (error) {
                            console.error("An error was encountered.", error);
                            //  Push the error to the foreground so it can be displayed to the user.
                            self.trigger('error', error.data);
                        }
                    }
                });

            }
        },

        cueVideoById: function (videoId, startSeconds) {
            //  Helps for keeping things in sync when the same video reloads.
            if (this.get('loadedVideoId') === videoId) {
                this.trigger('change:loadedVideoId');
            }

            this.set('loadedVideoId', videoId);

            youTubePlayer.cueVideoById({
                videoId: videoId,
                startSeconds: startSeconds || 0,
                suggestedQuality: Settings.get('suggestedQuality')
            });

            //  It's helpful to keep currentTime set here because the progress bar in foreground might be visually set,
            //  but until the video actually loads -- current time isn't set.
            this.set('currentTime', startSeconds || 0);

        },
            
        loadVideoById: function (videoId, startSeconds) {
            //  Helps for keeping things in sync when the same video reloads.
            if (this.get('loadedVideoId') === videoId) {
                this.trigger('change:loadedVideoId');
            }
            
            this.set('state', PlayerState.Buffering);
            this.set('loadedVideoId', videoId);

            youTubePlayer.loadVideoById({
                videoId: videoId,
                startSeconds: startSeconds || 0,
                suggestedQuality: Settings.get('suggestedQuality')
            });
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
            this.set('loadedVideoId', '');
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
        
        //  Once the Player indicates its loadedVideo has changed (to the video just selected in the stream) 
        //  Call play to change from cueing the video to playing, but let the stack clear first because loadedVideoId
        //  is set just before cueVideoById has finished.
        playOnceVideoChanges: function() {
            var self = this;

            this.once('change:loadedVideoId', function () {
                setTimeout(function () {
                    self.play();
                });
            });
        },

        seekTo: _.debounce(function (timeInSeconds) {

            var state = this.get('state');
            
            if (state === PlayerState.Unstarted || state === PlayerState.VideoCued) {
                this.cueVideoById(this.get('loadedVideoId'), timeInSeconds);
            } else {
                
                //  The true paramater allows the youTubePlayer to seek ahead past its buffered video.
                youTubePlayer.seekTo(timeInSeconds, true);
            }
            
        }, 100),
        
        //  Attempt to set playback quality to suggestedQuality or highest possible.
        setSuggestedQuality: function(suggestedQuality) {
            youTubePlayer.setPlaybackQuality(suggestedQuality);
        }
    });

    //  Exposed globally so that the foreground can access the same instance through chrome.extension.getBackgroundPage()
    window.YouTubePlayer = new YouTubePlayer();
    return window.YouTubePlayer;
});