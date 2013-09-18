//  Exposed globally so that Chrome Extension's foreground can access through chrome.extension.getBackgroundPage()
var YouTubePlayer = null;

define([
    'youTubePlayerAPI',
    'settings',
    'playerState'
], function (YouTubePlayerAPI, Settings, PlayerState) {
    'use strict';

    //  This is the actual YouTube Player API object housed within the iframe.
    //  Only player.js should be able to interact with it; all public needs go through streamusPlayer.
    var youTubePlayer = null;

    var youTubePlayerModel = Backbone.Model.extend({
        defaults: {
            //  Returns the elapsed time of the currently loaded video. Returns 0 if no video is playing
            currentTime: 0,
            //  API will fire a 'ready' event after initialization which indicates the player can now respond accept commands
            ready: false,
            state: PlayerState.UNSTARTED,
            videoStreamSrc: null,
            //  This will be set after the player is ready and can communicate its true value.
            //  Default to 50 because having the music on and audible, but not blasting, seems like the best default if we fail for some reason.
            volume: 50,
            //  This will be set after the player is ready and can communicate its true value.
            muted: false,
            loadedVideoId: '',
            //  The video object which will hold the iframe-removed player
            streamusPlayer: null
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
                
                var streamusPlayer = self.get('streamusPlayer');
                
                if (streamusPlayer != null) {
                    streamusPlayer.volume = volume / 100;
                } 
            });

            this.on('change:muted', function (model, isMuted) {

                //  Same logic here as with the volume
                if (isMuted) {
                    youTubePlayer.mute();
                } else {
                    youTubePlayer.unMute();
                }
                
                var streamusPlayer = self.get('streamusPlayer');
                
                if (streamusPlayer != null) {
                    streamusPlayer.muted = isMuted;
                }
            });


            var refreshPausedVideoInterval = null;
            this.on('change:state', function (model, state) {

                clearInterval(refreshPausedVideoInterval);
       
                if (state === PlayerState.PAUSED) {

                    //  Start a long running timer when the player becomes paused. This is because a YouTube video
                    //  will expire after ~8+ hours of being loaded. This only happens if the player is paused.
                    //  Refresh videos after every 8 hours.
                    //var eightHoursInMilliseconds = 28800000;

                    //refreshPausedVideoInterval = setInterval(function () {

                    //    console.log("refreshPause interval has fired.");

                    //    var currentTime = parseInt(self.get('currentTime'), 10);
                    //console.log("currentTime:", currentTime);
                    //var loadedVideoId = self.get('loadedVideoId');
                    
                    //    youTubePlayer.loadVideoById({
                    //        videoId: 'tvY7Nw1i6Kw',
                    //        startSeconds: currentTime,
                    //        suggestedQuality: Settings.get('suggestedQuality')
                    //    });
                        

                    //self.stop();
                    ////  TODO: Seems weird to have to call cueVideoById and seekTo
                    //self.cueVideoById(loadedVideoId);
                    //self.seekTo(currentTime);

                    //}, eightHoursInMilliseconds);

                }

            });

            this.on('change:loadedVideoId', function () {
                console.log("clearing seekTo interval");
                clearInterval(seekToInterval);
                
                console.log("Change loadedVideoId detected, setting time to 0");
                youTubeVideo.currentTime = 0;
            });
            
            var youTubeVideo = $('#YouTubeVideo');
            youTubeVideo.on('play', function () {
                self.set('state', PlayerState.PLAYING);
            });

            youTubeVideo.on('pause', function () {
                self.set('state', PlayerState.PAUSED);
            });

            youTubeVideo.on('waiting', function () {
                self.set('state', PlayerState.BUFFERING);
            });

            youTubeVideo.on('seeking', function () {
                if (self.get('state') === PlayerState.PLAYING) {
                    self.set('state', PlayerState.BUFFERING);
                }
            });

            youTubeVideo.on('seeked', function () {
                if (self.get('state') === PlayerState.BUFFERING) {
                    self.set('state', PlayerState.PLAYING);
                }
            });

            youTubeVideo.on('ended', function () {
                console.log("youTubeVideo on ended detected. Setting playerState to ended");
                self.set('state', PlayerState.ENDED);
            });

            youTubeVideo.on('error', function (error) {
                console.error("Error:", error);
            });

            //  TODO: Would be nice to use this instead of a polling interval.
            youTubeVideo.on('timeupdate', function () {
                console.log("timeUpdate setting currentTime to:", this.currentTime);
                self.set('currentTime', Math.ceil(this.currentTime));
            });

            youTubeVideo.on('loadedmetadata', function () {
                console.log("loadedmetadata, these times should be equal: ", self.get('currentTime'), youTubePlayer.getCurrentTime());
                this.currentTime = self.get('currentTime');
            });
            
            var seekToInterval = null;
            youTubeVideo.on('canplay', function () {
                console.log("canplay");
                self.set('streamusPlayer', this);

                //  I store volume out of 100 and volume on HTML5 player is range of 0 to 1 so divide by 100.
                this.volume = self.get('volume') / 100;

                var videoStreamSrc = youTubeVideo.attr('src');

                //  This ensure that youTube continues to update blob data.
                if (videoStreamSrc.indexOf('blob') > -1) {

                    console.log("blob detected");
                    clearInterval(seekToInterval);
                    seekToInterval = setInterval(function () {

                        console.log("refretching blob");

                        if (self.get('streamusPlayer') != null && self.get('state') === PlayerState.PLAYING) {
                            var currentTime = self.get('streamusPlayer').currentTime;
                            youTubePlayer.seekTo(currentTime, true);
                        }

                    }, 20000);
                }

            });
            
            this.on('change:videoStreamSrc', function (model, videoStreamSrc) {
                //  Resetting streamusPlayer because it might not be able to play on src change.
                self.set('streamusPlayer', null);
                youTubeVideo.attr('src', videoStreamSrc);
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
                    events: {
                        'onReady': function () {

                            self.set('muted', youTubePlayer.isMuted());
                            self.set('volume', youTubePlayer.getVolume());

                            //  Announce that the YouTube Player is ready to go.
                            self.set('ready', true);
                        },
                        'onStateChange': function () {
                            console.log("STATE:", youTubePlayer.getPlayerState());
                            console.log("Time:", youTubePlayer.getCurrentTime());
                        },
                        'onError': function (error) {

                            console.error("An error was encountered.", error);

                            switch (error.data) {
                                case 100:
                                    alert("Video requested is not found. This occurs when a video has been removed or it has been marked as private.");
                                    break;
                                case 101:
                                case 150:
                                    alert("Video requested does not allow playback in the embedded players.");
                                    break;
                            }                            

                        }
                    }
                });

            };
        },

        //  YouTube won't give up the data if the src URL is non-blob unless we trigger a seekTo. Bastards.
        triggerInitialLoadDataSeekTo: function () {
            console.log("initial load seekto going");
            youTubePlayer.seekTo(1, true);
        },
            
        cueVideoById: function (videoId) {
            this.set('loadedVideoId', videoId);

            var streamusPlayer = this.get('streamusPlayer');
            
            console.log("Streamus Player:", streamusPlayer);

            if (streamusPlayer != null) {
                console.log("paused and removing autoplay");
                streamusPlayer.pause();
            }

            //  Sometimes streamusPlayer is null. Need to fix that I think.
            //  If YouTubeVideo is loading its metadata we need to keep its state in sync regardless.
            $('#YouTubeVideo').removeAttr('autoplay');

            youTubePlayer.loadVideoById({
                videoId: videoId,
                startSeconds: 0,
                suggestedQuality: Settings.get('suggestedQuality')
            });
        },
            
        loadVideoById: function (videoId) {
            var streamusPlayer = this.get('streamusPlayer');

            if (streamusPlayer != null) {
                $(streamusPlayer).attr('autoplay', true);
            }
            
            this.set('state', PlayerState.BUFFERING);
            this.set('loadedVideoId', videoId);

            youTubePlayer.loadVideoById({
                videoId: videoId,
                startSeconds: 0,
                suggestedQuality: Settings.get('suggestedQuality')
            });
        },
        
        isPlaying: function () {
            return this.get('state') === PlayerState.PLAYING;
        },
        
        mute: function () {
            this.set('muted', true);

            var streamusPlayer = this.get('streamusPlayer');

            if (streamusPlayer) {
                streamusPlayer.muted = true;
            } else {
                youTubePlayer.mute();
            }
        },
        
        unMute: function () {
            this.set('muted', false);
            
            var streamusPlayer = this.get('streamusPlayer');

            if (streamusPlayer) {
                streamusPlayer.muted = false;
            } else {
                youTubePlayer.unMute();
            }
        },
        
        stop: function () {

            this.set('state', PlayerState.UNSTARTED);

            var streamusPlayer = this.get('streamusPlayer');

            if (streamusPlayer) {
                streamusPlayer.pause();
            }
            
            this.set('streamusPlayer', null);

            youTubePlayer.stopVideo();
            this.set('loadedVideoId', '');
        },

        pause: function () {
            var streamusPlayer = this.get('streamusPlayer');

            if (streamusPlayer) {
                streamusPlayer.pause();
            } else {
                //  If YouTubeVideo is loading its metadata we need to keep its state in sync regardless.
                $('#YouTubeVideo').removeAttr('autoplay');
                youTubePlayer.pauseVideo();
            }
        },
            
        play: function () {
  
            if (!this.isPlaying()) {

                this.set('state', PlayerState.BUFFERING);
                var streamusPlayer = this.get('streamusPlayer');

                if (streamusPlayer) {
                    streamusPlayer.play();
                } else {
                    //  If YouTubeVideo is loading its metadata we need to keep its state in sync regardless.
                    $('#YouTubeVideo').attr('autoplay', 'true');
                    youTubePlayer.playVideo();
                }

            }
        },

        //  TODO: For certain long videos, (example: http://youtu.be/_EKBpHbRTPI ) seekTo's seeked event never returns.
        //  I think this is due to YouTube's old implementation. I might be able to get around this by calling loadVideoById at a specific time-point??
        //  seekTo can be spammed via mousewheel scrolling so debounce as to not spam the player, but still capture final result.
        seekTo: _.debounce(function (timeInSeconds) {

            //  Seek even if streamusPlayer is defined because we probably need to update the blob if it is.
            //  The true paramater allows the youTubePlayer to seek ahead past its buffered video.
            youTubePlayer.seekTo(timeInSeconds, true);

            this.set('currentTime', timeInSeconds);
            var streamusPlayer = this.get('streamusPlayer');

            if (streamusPlayer != null) {
                streamusPlayer.currentTime = timeInSeconds;
            }

        }, 100),
        
        //  Attempt to set playback quality to suggestedQuality or highest possible.
        setSuggestedQuality: function(suggestedQuality) {

            youTubePlayer.setPlaybackQuality(suggestedQuality);
        }
    });

    YouTubePlayer = new youTubePlayerModel();

    return YouTubePlayer;
});