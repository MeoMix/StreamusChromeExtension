define(function(require) {
  'use strict';

  var StreamControlBarView = require('foreground/view/streamControlBar/streamControlBarView');
  var Player = require('background/model/player');
  var Settings = require('background/model/settings');
  var YouTubePlayer = require('background/model/youTubePlayer');
  var viewTestUtility = require('test/foreground/view/viewTestUtility');

  describe('StreamControlBarView', function() {
    beforeEach(function() {
      this.documentFragment = document.createDocumentFragment();
      this.view = new StreamControlBarView({
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