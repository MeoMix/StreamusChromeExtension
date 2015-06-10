define(function(require) {
  'use strict';

  var TimeSlider = require('foreground/model/stream/timeSlider');

  describe('TimeSlider', function() {
    beforeEach(function() {
      this.timeSlider = new TimeSlider();
    });

    describe('incrementCurrentTime', function() {
      it('should be able to add a value to its current time', function() {
        var incrementedTime = this.timeSlider.incrementCurrentTime(1);
        expect(incrementedTime).to.equal(1);
      });
    });
  });
});