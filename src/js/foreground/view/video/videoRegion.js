define(function(require) {
  'use strict';

  var VideoView = require('foreground/view/video/videoView');

  var VideoRegion = Marionette.Region.extend({
    initialize: function() {
      this.listenTo(StreamusFG.channels.foregroundArea.vent, 'rendered', this._onForegroundAreaRendered);
      this.listenTo(StreamusFG.channels.video.commands, 'show:video', this._showVideo);
    },

    _onForegroundAreaRendered: function() {
      this._createVideoView();
    },

    _createVideoView: function() {
      var videoView = new VideoView({
        player: StreamusFG.backgroundProperties.player
      });

      this.show(videoView);
      this.listenTo(StreamusFG.channels.video.commands, 'hide:video', this._hideVideo);

      if (StreamusFG.backgroundProperties.videoButton.get('enabled')) {
        this._showVideo({
          instant: true
        });
      }
    },

    _showVideo: function(options) {
      // If the view should be visible when UI first loads then do not transition.
      if (options && options.instant) {
        this.$el.addClass('is-instant');
      }

      this.$el.addClass('is-visible');
      this.currentView.triggerMethod('visible');
    },

    _hideVideo: function() {
      this.$el.removeClass('is-instant is-visible');
    }
  });

  return VideoRegion;
});