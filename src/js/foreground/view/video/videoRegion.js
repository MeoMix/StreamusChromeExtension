define(function(require) {
  'use strict';

  var VideoView = require('foreground/view/video/videoView');

  var VideoRegion = Marionette.Region.extend({
    initialize: function() {
      this.listenTo(StreamusFG.channels.foregroundArea.vent, 'rendered', this._onForegroundAreaRendered);
    },

    _onForegroundAreaRendered: function() {
      this._createVideoView();
    },

    _createVideoView: function() {
      this.show(new VideoView({
        player: StreamusFG.backgroundProperties.player
      }));
    }
  });

  return VideoRegion;
});