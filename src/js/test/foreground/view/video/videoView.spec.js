define(function(require) {
  'use strict';

  var VideoView = require('foreground/view/video/videoView');
  var Player = require('background/model/player');
  var Settings = require('background/model/settings');
  var YouTubePlayer = require('background/model/youTubePlayer');
  var viewTestUtility = require('test/foreground/view/viewTestUtility');

  xdescribe('VideoView', function() {
    beforeEach(function() {
      this.documentFragment = document.createDocumentFragment();
      this.view = new VideoView({
        player: new Player({
          settings: new Settings(),
          youTubePlayer: new YouTubePlayer()
        })
      });
    });

    afterEach(function() {
      this.view.destroy();
    });

    viewTestUtility.ensureBasicAssumptions.call(this);
  });
});