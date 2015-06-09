define(function(require) {
  'use strict';

  var TimeSliderView = require('foreground/view/stream/timeSliderView');
  var TimeSlider = require('foreground/model/stream/timeSlider');
  var StreamItems = require('background/collection/streamItems');
  var Player = require('background/model/player');
  var Settings = require('background/model/settings');
  var YouTubePlayer = require('background/model/youTubePlayer');
  var viewTestUtility = require('test/foreground/view/viewTestUtility');

  describe('TimeSliderView', function() {
    beforeEach(function() {
      this.documentFragment = document.createDocumentFragment();
      this.view = new TimeSliderView({
        model: new TimeSlider(),
        streamItems: new StreamItems(),
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