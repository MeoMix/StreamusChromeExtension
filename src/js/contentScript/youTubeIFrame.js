// This content script runs against YouTube's video iframe before any of their scripts have loaded.
// It forces YouTube to use the HTML5 video player, hooks into requests sent from their server,
// and attempts to listen for interesting events on the <video> itself. If the <video> element
// is not found then it will poll for its existence for a few seconds before emitting an error.
(function() {
  'use strict';

  var YouTubeIFrameContentScript = function() {
    // Record any errors emitted by YouTube
    this.errors = [];
    // The port used for external communication w/ the extension.
    this.port = null;
    // The <video> hosting the active YouTube video
    this.videoStream = null;

    // This is a heavy-handed approach for forcing YouTube to use the HTML5 player if possible.
    // By forcing canPlayType to return 'probably' YouTube will assume the browser supports HTML5 video.
    // This is necessary because other extensions and/or customer browsers mess with canPlayType and
    // prevent YouTube from loading HTML5.
    this.patchVideoCanPlayType = function() {
      var script = document.createElement('script');
      script.innerHTML = 'HTMLMediaElement.prototype.canPlayType = function() { return "probably"; };';
      document.head.appendChild(script);
    }.bind(this);

    // Attach event listeners to the <video> element.
    this.monitorVideoStream = function() {
      var lastPostedCurrentTime = null;

      this.videoStream.addEventListener('loadstart', function() {
        lastPostedCurrentTime = null;
      }.bind(this));

      this.videoStream.addEventListener('timeupdate', function() {
        // Round currentTime to the nearest second to prevent flooding the port with unnecessary messages.
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

    // Create the port needed to communicate with the parent extension.
    this.initializePort = function() {
      this.port = chrome.runtime.connect({
        name: 'youTubeIFrameConnectRequest'
      });
    }.bind(this);

    // If YouTube fails to initialize properly - notify the extension so that logs can be taken.
    // Include any errors encountered to help with debugging.
    this.notifyYouTubeLoadFailure = function() {
      this.port.postMessage({
        error: 'videoStream not found. Errors: ' + JSON.stringify(this.errors)
      });
    }.bind(this);

    // Attempt to fetch the <video> element from the page. If found, monitor it for interesting changes.
    // Otherwise, it might not be loaded yet, so do nothing and fail silently for now.
    this.tryMonitorVideoStream = function() {
      var isMonitoring = false;
      this.videoStream = document.querySelectorAll('.video-stream')[0] || null;

      if (this.videoStream !== null) {
        this.monitorVideoStream();
        isMonitoring = true;
      }

      return isMonitoring;
    }.bind(this);

    // If failed to find the videoStream -- keep searching for a bit. Opera can run content scripts too early and
    // other oddities could potentially happen / YouTube is just slow to load.
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

    // If YouTube errors out for any reason - record the error so that it can be communicated to the extension.
    this.onWindowError = function(event) {
      this.errors.push({
        message: event.message,
        url: event.filename,
        lineNumber: event.lineno,
        columnNumber: event.colno,
        error: event.error
      });
    }.bind(this);

    // Initialization code:
    window.addEventListener('error', this.onWindowError);
    this.patchVideoCanPlayType();
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