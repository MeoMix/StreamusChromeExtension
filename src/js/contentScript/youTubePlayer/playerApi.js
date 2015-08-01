(function() {
  'use strict';

  // Disable YouTube's player resizing logic: https://github.com/YePpHa/YouTubeCenter/issues/1844
  // Run this before document ready so that YouTube's scripts read the modified value during initialization.
  window.matchMedia = null;

  // This is a heavy-handed approach for forcing YouTube to use the HTML5 player if possible.
  // By forcing canPlayType to return 'probably' YouTube will assume the browser supports HTML5 video.
  // This is necessary because other extensions and/or customer browsers mess with canPlayType and
  // prevent YouTube from loading HTML5.
  HTMLMediaElement.prototype.canPlayType = function() { return 'probably'; };

  var PlayerAPIScript = function() {
    // TODO: It would be nice to not have this duplicated from videoCommand.js, but I need to find a better way to inject it.
    var VideoCommand = {
      Play: 'play',
      Pause: 'pause',
      SetVolume: 'setVolume',
      SetMuted: 'setMuted',
      SetCurrentTime: 'setCurrentTime',
      SetPlaybackQuality: 'setPlaybackQuality'
    };

    var urlToVideoOptions = function(url) {
      var queryParameters = url.search.substr(1);

      var videoOptions = {};
      queryParameters.split('&').forEach(function(part) {
        var item = part.split('=');
        var key = item[0];
        var value = decodeURIComponent(item[1]);

        // Skip the 'streamus' query parameter because it's simply used for injecting content scripts.
        if (key !== 'streamus' && key !== 'v' && key !== 't') {
          switch (key) {
            case 'suggestedQuality':
              // suggestedQuality is already the appropriate type.
              break;
            case 'volume':
              value = parseInt(value, 10);
              break;
            case 'muted':
            case 'playOnActivate':
              value = value === 'true' ? true : false;
              break;
            default:
              throw new Error('Unhandled queryParameter: ' + key);
          }

          videoOptions[key] = value;
        }
      });

      return videoOptions;
    };

    var videoOptions = urlToVideoOptions(window.location);

    var playerApi = window.yt.player.getPlayerByElement('player-api');
    var apiIsReady = false;
    var cuedVolumeCommands = 0;

    // TODO: I need to check apiIsReady for all supported commands.
    function setVolume(volume) {
      if (apiIsReady) {
        var currentVolume = playerApi.getVolume();

        if (currentVolume !== volume) {
          cuedVolumeCommands++;
          playerApi.setVolume(volume);
        }
      } else {
        videoOptions.volume = volume;
      }
    }

    function setMuted(muted) {
      if (apiIsReady) {
        var currentMuted = playerApi.isMuted();

        if (currentMuted !== muted) {
          cuedVolumeCommands++;

          if (muted) {
            playerApi.mute();
          } else {
            playerApi.unMute();
          }
        }
      } else {
        videoOptions.muted = muted;
      }
    }

    function navigate(urlString) {
      // Pause the video so that time doesn't tick + audio doesn't continue once navigation is happening.
      playerApi.pauseVideo();

      var url = new URL(urlString);
      videoOptions = urlToVideoOptions(url);
      window.spf.navigate(urlString);
    }

    function doVideoCommand(videoCommand, value) {
      switch (videoCommand) {
        case VideoCommand.SetPlaybackQuality:
          playerApi.setPlaybackQuality(value);
          break;
        case VideoCommand.Play:
          playerApi.playVideo();
          break;
        case VideoCommand.Pause:
          playerApi.pauseVideo();
          break;
        case VideoCommand.SetVolume:
          setVolume(value);
          break;
        case VideoCommand.SetMuted:
          setMuted(value);
          break;
        case VideoCommand.SetCurrentTime:
          playerApi.seekTo(value);
          break;
        default:
          console.error('Unhandled command:', videoCommand);
      }
    }

    // This file runs within the YouTube page's sandbox rather than Streamus' sandbox.
    // It has the ability to access variables on the page, but not Chrome APIs.
    window.addEventListener('message', function(message) {
      if (!_.isUndefined(message.data.navigate)) {
        navigate(message.data.navigate.urlString);
      }

      if (!_.isUndefined(message.data.videoCommand)) {
        doVideoCommand(message.data.videoCommand, message.data.value);
      }
    });

    var announceApiReady = function() {
      apiIsReady = true;

      if (!videoOptions.playOnActivate) {
        playerApi.pauseVideo();
      }

      setVolume(videoOptions.volume);
      setMuted(videoOptions.muted);

      playerApi.setPlaybackQuality(videoOptions.suggestedQuality);

      // Ensure that when a song ends it doesn't auto-nav to the next one.
      var autonavStateDisabled = 1;
      playerApi.setAutonavState(autonavStateDisabled);

      window.postMessage({
        apiReady: true,
        volume: videoOptions.volume,
        muted: videoOptions.muted,
        state: playerApi.getPlayerState(),
        isNewLayout: playerApi.getUpdatedConfigurationData().args.fexp.indexOf('9407675') !== -1
      }, '*');
    };

    var onPlayerApiReady = function() {
      announceApiReady();
      playerApi.removeEventListener(onPlayerApiReady);
    };

    if (playerApi.isReady()) {
      announceApiReady();
    } else {
      playerApi.addEventListener('onReady', onPlayerApiReady);
    }

    // window.postMessage has an internal throttling mechanism which can cause a lot of issues for accurate data reporting.
    // For instance, if the volume is changing rapidly, incorrect volume values will leak out of postMessage.
    // Using an explicit throttling mechanism results in much more anticipated behavior.
    // 150 appears to be roughly the minimum possible throttle rate. 100 causes window.postMessage to throttle.
    var throttledWindowPostMessage = _.throttle(function(message) {
      window.postMessage(message, '*');
    }, 150);

    playerApi.addEventListener('onStateChange', function(state) {
      window.postMessage({
        state: state
      }, '*');
    });

    playerApi.addEventListener('onVolumeChange', function(state) {
      // It's important to keep track of cued commands because onVolumeChange is used for both muted and volume changes.
      // So, if volume and muted have both changed then the first 'onVolumeChange' event will contain an incorrect value.
      if (cuedVolumeCommands > 0) {
        cuedVolumeCommands--;
      }

      if (cuedVolumeCommands === 0) {
        throttledWindowPostMessage(state);
      }
    });

    playerApi.addEventListener('onError', function(error) {
      window.postMessage({
        error: error
      }, '*');
    });

    window.addEventListener('spfdone', function() {
      if (!videoOptions.playOnActivate) {
        playerApi.pauseVideo();
      }
    });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      window.playerAPIScript = new PlayerAPIScript();
    });
  } else {
    window.playerAPIScript = new PlayerAPIScript();
  }
})();