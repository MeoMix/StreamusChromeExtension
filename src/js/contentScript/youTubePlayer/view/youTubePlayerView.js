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
      _.bindAll(this, '_onWindowUnload', '_onWindowSpfDone');

      window.addEventListener('unload', this._onWindowUnload);
      window.addEventListener('spfdone', this._onWindowSpfDone);
    },

    onRender: function() {
      this.videoStreamView = new VideoStreamView({
        model: new VideoStream()
      });

      this._showWatermark();
    },

    onBeforeDestroy: function() {
      window.removeEventListener('unload', this._onWindowUnload);
      window.removeEventListener('spfdone', this._onWindowSpfDone);
    },

    _onWindowUnload: function() {
      Application.port.postMessage({
        videoState: 'paused',
        windowEvent: 'unload'
      });
    },

    // Whenever the video URL changes - update the button for showing it on YouTube.
    _onWindowSpfDone: function() {
      this.ui.showYouTubeButton.attr('href', this._getVideoUrl());
    },

    _onClickShowYouTubeButton: function() {
      window.postMessage({
        videoCommand: VideoCommand.PauseVideo
      }, window.location.origin);
    },

    // Mimic YouTube's watermark template since it doesn't appear when hiding the control bar manually.
    _showWatermark: function() {
      this.ui.settingsButton.before(_.template(WatermarkTemplate, {
        // TODO: Tooltip isn't stylized on new layout.
        videoUrl: this._getVideoUrl()
      }));
      this.bindUIElements();
    },

    _getVideoUrl: function() {
      var href = window.location.href;
      var videoUrl = href.substring(0, href.indexOf('&'));
      return videoUrl;
    }
  });

  return YouTubePlayerView;
});