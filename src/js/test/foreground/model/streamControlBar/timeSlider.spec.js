'use strict';
import TimeSlider from 'foreground/model/streamControlBar/timeSlider';

describe('TimeSlider', function() {
  beforeEach(function() {
    var player = TestUtility.buildPlayer();

    this.timeSlider = new TimeSlider({
      currentTime: player.get('currentTime'),
      player: player
    });
  });

  describe('_setEnabledState', function() {
    it('should set isEnabled to true if a loaded video exists', function() {
      this.timeSlider._setEnabledState({});
      expect(this.timeSlider.get('isEnabled')).to.equal(true);
    });

    it('should set isEnabled to false if a loaded video does not exist', function() {
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