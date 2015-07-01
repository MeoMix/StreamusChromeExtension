define(function(require) {
  'use strict';

  var ForegroundAreaView = require('foreground/view/foregroundAreaView');
  var VideoView = require('foreground/view/video/videoView');
  var Player = require('background/model/player');
  var Settings = require('background/model/settings');
  var YouTubePlayer = require('background/model/youTubePlayer');
  var AnalyticsManager = require('background/model/analyticsManager');
  var viewTestUtility = require('test/foreground/view/viewTestUtility');

  describe('ForegroundAreaView', function() {
    beforeEach(function() {
      // PhantomJS doesn't support the <video> tag.
      if (!_.isUndefined(window._phantom)) {
        sinon.stub(VideoView.prototype, '_ensureInitialState');
      }
      this.documentFragment = document.createDocumentFragment();
      this.view = new ForegroundAreaView({
        el: false,
        player: new Player({
          settings: new Settings(),
          youTubePlayer: new YouTubePlayer()
        }),
        settings: new Settings(),
        analyticsManager: new AnalyticsManager()
      });
    });

    afterEach(function() {
      this.view.destroy();
      // PhantomJS doesn't support the <video> tag.
      if (!_.isUndefined(window._phantom)) {
        VideoView.prototype._ensureInitialState.restore();
      }
    });

    viewTestUtility.ensureBasicAssumptions.call(this);
  });
});