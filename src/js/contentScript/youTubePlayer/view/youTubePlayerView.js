define(function(require) {
  'use strict';

  var VideoStreamView = require('view/videoStreamView');
  var VideoStream = require('model/videoStream');
  var WatermarkTemplate = require('text!template/contentScript/youTubePlayer/watermark.html');

  var YouTubePlayerView = Marionette.LayoutView.extend({
    el: 'body',
    template: false,

    ui: {
      bottomGradient: '.ytp-gradient-bottom',
      html5VideoPlayer: '.html5-video-player'
    },

    videoStreamView: null,

    initialize: function() {
      $(window).on('unload', this._onWindowUnload.bind(this));
    },

    onRender: function() {
      this._showWatermark();
      this.videoStreamView = new VideoStreamView({
        model: new VideoStream()
      });

      // TODO: Kind of odd coupling + not actually the correct way to set these classes.
      //var videoOptions = Application.port.get('videoOptions');
      //if (!_.isNull(videoOptions) && !videoOptions.playOnActivate) {
      //  this.ui.html5VideoPlayer.removeClass('playing-mode');
      //  this.ui.html5VideoPlayer.addClass('paused-mode');
      //}
    },

    _onWindowUnload: function() {
      Application.port.postMessage({
        videoState: 'paused',
        windowEvent: 'unload'
      });
    },

    // Mimic YouTube's watermark template since it doesn't appear when hiding the control bar manually.
    _showWatermark: function() {
      this.ui.bottomGradient.before(_.template(WatermarkTemplate, {
        videoUrl: window.location.href.replace('&streamus=1', '')
      }));
    }
  });

  return YouTubePlayerView;
});