define(function(require) {
  'use strict';

  var TimeSlider = require('foreground/model/streamControlBar/timeSlider');
  var Player = require('background/model/player');
  var Settings = require('background/model/settings');
  var YouTubePlayer = require('background/model/youTubePlayer');

  describe('TimeSlider', function() {
    beforeEach(function() {
      var player = new Player({
        settings: new Settings(),
        youTubePlayer: new YouTubePlayer()
      });

      this.timeSlider = new TimeSlider({
        currentTime: player.get('currentTime'),
        player: player
      });
    });

    describe('_setEnabledState', function() {
      it('should set isEnabled to true if a loaded song exists', function() {
        this.timeSlider._setEnabledState({});
        expect(this.timeSlider.get('isEnabled')).to.equal(true);
      });

      it('should set isEnabled to false if a loaded song does not exist', function() {
        this.timeSlider._setEnabledState(null);
        expect(this.timeSlider.get('isEnabled')).to.equal(false);
      });
    });

    describe('incrementCurrentTime', function() {
      it('should be able to add a value to its current time', function() {
        var incrementedTime = this.timeSlider.incrementCurrentTime(1);
        expect(incrementedTime).to.equal(1);
      });
    });
  });
});