define(function(require) {
  'use strict';

  var PlayPauseButtonView = require('foreground/view/streamControlBar/playPauseButtonView');
  var PlayPauseButton = require('background/model/playPauseButton');
  var StreamItems = require('background/collection/streamItems');
  var viewTestUtility = require('test/foreground/view/viewTestUtility');

  describe('PlayPauseButtonView', function() {
    beforeEach(function() {
      this.documentFragment = document.createDocumentFragment();

      var player = TestUtility.buildPlayer();

      this.view = new PlayPauseButtonView({
        model: new PlayPauseButton({
          player: player,
          streamItems: new StreamItems()
        }),
        player: player
      });
    });

    afterEach(function() {
      this.view.destroy();
    });

    viewTestUtility.ensureBasicAssumptions.call(this);
  });
});