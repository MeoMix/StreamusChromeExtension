define(function(require) {
  'use strict';

  var TimeLabelAreaView = require('foreground/view/stream/timeLabelAreaView');
  var TimeLabelArea = require('foreground/model/stream/timeLabelArea');
  var TimeSlider = require('foreground/model/stream/timeSlider');
  var StreamItems = require('background/collection/streamItems');
  var Player = require('background/model/player');
  var Settings = require('background/model/settings');
  var YouTubePlayer = require('background/model/youTubePlayer');
  var viewTestUtility = require('test/foreground/view/viewTestUtility');

  describe('TimeLabelAreaView', function() {
    beforeEach(function() {
      this.documentFragment = document.createDocumentFragment();
      this.view = new TimeLabelAreaView({
        model: new TimeLabelArea(),
        streamItems: new StreamItems(),
        timeSlider: new TimeSlider(),
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