define(function(require) {
  'use strict';

  var VideoStreamView = require('view/videoStreamView');
  var VideoStream = require('model/videoStream');
  var VideoCommand = require('common/enum/videoCommand');
  var WatermarkTemplate = require('text!template/contentScript/youTubePlayer/watermark.html');

  var YouTubePlayerView = Marionette.LayoutView.extend({
    el: 'body',
    template: false,

    useCustomUiSelector: true,
    ui: {
      settingsButton: '.ytp-settings-button',
      showYouTubeButton: '.ytp-youtube-button',
      html5VideoPlayer: '.html5-video-player',
      autoplayCheckbox: '#autoplay-checkbox'
    },

    events: {
      'click @ui.showYouTubeButton': '_onClickShowYouTubeButton'
    },

    videoStreamView: null,

    initialize: function() {
      // Bind pre-emptively so that removeEventListener is able to find the correct function reference.
      this._onWindowUnload = this._onWindowUnload.bind(this);
      this._onWindowMessage = this._onWindowMessage.bind(this);

      window.addEventListener('unload', this._onWindowUnload);
      window.addEventListener('message', this._onWindowMessage);
    },

    onRender: function() {
      this.videoStreamView = new VideoStreamView({
        model: new VideoStream()
      });
    },

    onBeforeDestroy: function() {
      window.removeEventListener('unload', this._onWindowUnload);
      window.removeEventListener('message', this._onWindowMessage);
    },

    _onWindowUnload: function() {
      Application.port.postMessage({
        videoState: 'paused',
        windowEvent: 'unload'
      });
    },

    _onClickShowYouTubeButton: function() {
      window.postMessage({
        videoCommand: VideoCommand.Pause
      }, '*');
    },

    _onWindowMessage: function(message) {
      if (!_.isUndefined(message.data.isNewLayout)) {
        if (message.data.isNewLayout) {
          this._showWatermark();
        }
      }
    },

    // Mimic YouTube's watermark template since it doesn't appear when hiding the control bar manually.
    _showWatermark: function() {
      var href = window.location.href;

      this.ui.settingsButton.before(_.template(WatermarkTemplate, {
        // TODO: Tooltip isn't stylized on new layout.
        videoUrl: href.substring(0, href.indexOf('&'))
      }));
    }
  });

  return YouTubePlayerView;
});