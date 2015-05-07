//  This content script runs against YouTube's video iframe before any of their scripts have loaded.
//  It forces YouTube to use the HTML5 video player, hooks into requests sent from their server,
//  and attempts to listen for interesting events on the <video> itself. If the <video> element
//  is not found then it will poll for its existence for a few seconds before emitting an error.
(function() {
    'use strict';

    var YouTubeIFrameContentScript = function() {
        //  Record any errors emitted by YouTube
        this.errors = [];
        //  The port used for external communication w/ the extension.
        this.port = null;
        //  The <video> hosting the active YouTube video
        this.videoStream = null;

        //  This is a heavy-handed approach for ensuring that Streamus will *always* be given an HTML5 player by YouTube if at all possible.
        //  By overloading canPlayType and forcing it to return 'probably' - YouTube will always assume that the browser can handle HTML5 video.
        //  Since Streamus only runs in browsers which support HTML5 video - canPlayType technically should always return 'probably'.
        //  However, sometimes other extensions or custom browsers (i.e. Slimjet) mess with the canPlayType prototype and prevent YouTube from loading HTML5.
        //  If Flash loads then Streamus is doomed. So, it's OK to be heavy-handed and potentially break stuff because the options are either "make it work" or "already broken"
        this.patchVideoCanPlayType = function() {
            var script = document.createElement('script');
            script.innerHTML = 'HTMLMediaElement.prototype.canPlayType = function() { return "probably"; };';
            document.head.appendChild(script);
        }.bind(this);

        //  Append a script to the page which will intercept YouTube's server requests and post messages out of the iframe with details about those requests.
        //  Needs to be an appended script because content scripts are sandboxed in such a way that they do not share variables with appended scripts.
        this.appendInterceptorScript = function() {
            //var interceptorScript = document.createElement('script');
            //interceptorScript.src = chrome.runtime.getURL('js/contentScript/interceptor.js');
            //document.head.appendChild(interceptorScript);
        }.bind(this);

        //  Attach event listeners to the <video> element.
        this.monitorVideoStream = function() {
            var lastPostedCurrentTime = null;

            this.videoStream.addEventListener('loadstart', function() {
                lastPostedCurrentTime = null;
            }.bind(this));

            this.videoStream.addEventListener('timeupdate', function() {
                //  Round currentTime to the nearest second to prevent flooding the port with unnecessary messages.
                var currentTime = Math.ceil(this.videoStream.currentTime);

                if (currentTime !== lastPostedCurrentTime) {
                    this.port.postMessage({
                        currentTime: currentTime
                    });

                    lastPostedCurrentTime = currentTime;
                }
            }.bind(this));

            this.videoStream.addEventListener('seeking', function() {
                this.port.postMessage({
                    seeking: true
                });
            }.bind(this));

            this.videoStream.addEventListener('seeked', function() {
                this.port.postMessage({
                    seeking: false
                });
            }.bind(this));
        }.bind(this);

        //  Create the port needed to communicate with the parent extension.
        this.initializePort = function() {
            this.port = chrome.runtime.connect({
                name: 'youTubeIFrameConnectRequest'
            });

            //  The extension can request the *exact* time of YouTube's video player.
            //  Respond with that value, but also include a timestamp to account for the time it takes to send the postMessage.
            this.port.onMessage.addListener(function(message) {
                if (message === 'getCurrentTimeHighPrecision') {
                    var currentTime = this.videoStream === null ? 0 : this.videoStream.currentTime;

                    this.port.postMessage({
                        timestamp: Date.now(),
                        currentTimeHighPrecision: currentTime
                    });
                }
            }.bind(this));
        }.bind(this);

        //  If YouTube fails to initialize properly - notify the extension so that logs can be taken.
        //  Include any errors encountered to help with debugging.
        this.notifyYouTubeLoadFailure = function() {
            this.port.postMessage({
                error: 'videoStream not found. Errors: ' + JSON.stringify(this.errors)
            });
        }.bind(this);

        //  Attempt to fetch the <video> element from the page. If found, monitor it for interesting changes.
        //  Otherwise, it might not be loaded yet, so do nothing and fail silently for now.
        this.tryMonitorVideoStream = function() {
            var isMonitoring = false;
            this.videoStream = document.querySelectorAll('.video-stream')[0] || null;

            if (this.videoStream !== null) {
                this.monitorVideoStream();
                isMonitoring = true;
            }

            return isMonitoring;
        }.bind(this);

        //  If failed to find the videoStream -- keep searching for a bit. Opera can run content scripts too early and 
        //  other oddities could potentially happen / YouTube is just slow to load.
        this.pollForVideoStream = function() {
            var currentLoadAttempt = 0;
            var maxLoadAttempt = 5;
            var loadAttemptInterval = 1000;

            var loadVideoStreamInterval = setInterval(function() {
                var isMonitoring = this.tryMonitorVideoStream();

                if (isMonitoring || currentLoadAttempt === maxLoadAttempt) {
                    clearInterval(loadVideoStreamInterval);

                    if (!isMonitoring) {
                        this.notifyYouTubeLoadFailure();
                    }
                }

                currentLoadAttempt++;
            }.bind(this), loadAttemptInterval);
        }.bind(this);

        //  If YouTube errors out for any reason - record the error so that it can be communicated to the extension.
        this.onWindowError = function(message) {
            this.errors.push(message);
        }.bind(this);

        //  Initialization code: 
        window.addEventListener('error', this.onWindowError);
        this.patchVideoCanPlayType();
        this.appendInterceptorScript();
        this.initializePort();

        var isMonitoring = this.tryMonitorVideoStream();
        if (!isMonitoring) {
            this.pollForVideoStream();
        }
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            window.youTubeIFrameContentScript = new YouTubeIFrameContentScript();
        });
    } else {
        window.youTubeIFrameContentScript = new YouTubeIFrameContentScript();
    }
}());