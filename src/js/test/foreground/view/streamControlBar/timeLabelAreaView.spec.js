'use strict';
import TimeLabelAreaView from 'foreground/view/streamControlBar/timeLabelAreaView';
import TimeLabelArea from 'foreground/model/streamControlBar/timeLabelArea';
import TimeSlider from 'foreground/model/streamControlBar/timeSlider';
import StreamItems from 'background/collection/streamItems';
import ViewTestUtility from 'test/foreground/view/viewTestUtility';

describe('TimeLabelAreaView', function() {
  beforeEach(function() {
    this.documentFragment = document.createDocumentFragment();

    var player = TestUtility.buildPlayer();

    this.view = new TimeLabelAreaView({
      model: new TimeLabelArea(),
      streamItems: new StreamItems(),
      timeSlider: new TimeSlider({
        currentTime: player.get('currentTime'),
        player: player
      }),
      player: player
    });
  });

  afterEach(function() {
    this.view.destroy();
  });

  ViewTestUtility.ensureBasicAssumptions.call(this);

  describe('_getTotalTime', function() {
    it('should return 0 if there is no loaded video', function() {
      var totalTime = this.view._getTotalTime(null);
      expect(totalTime).to.equal(0);
    });

    it('should return the videos duration if it exists', function() {
      var video = TestUtility.buildVideo();
      var totalTime = this.view._getTotalTime(video);
      expect(totalTime).to.equal(video.get('duration'));
    });
  });

  describe('_getElapsedTime', function() {
    it('should return currentTime when showRemainingTime is false', function() {
      var elapsedTime = this.view._getElapsedTime(1, 2, false);
      expect(elapsedTime).to.equal(1);
    });

    it('should return the difference between totalTime and currentTime when showRemainingTime is true', function() {
      var elapsedTime = this.view._getElapsedTime(2, 10, true);
      expect(elapsedTime).to.equal(8);
    });
  });

  describe('when rendered', function() {
    beforeEach(function() {
      this.view.render();
    });

    describe('_setElapsedTimeLabelTooltipText', function() {
      it('should not error when called with showRemainingTime: true', function() {
        this.view._setElapsedTimeLabelTooltipText(true);
      });

      it('should not error when called with showRemainingTime: false', function() {
        this.view._setElapsedTimeLabelTooltipText(false);
      });
    });

    describe('_setElapsedTimeLabelText', function() {
      it('should not error when called with currentTime: 0', function() {
        this.view._setElapsedTimeLabelText(0);
      });

      it('should not error when called with currentTime: >0', function() {
        this.view._setElapsedTimeLabelText(1);
      });
    });

    describe('_setTotalTimeLabelText', function() {
      it('should not error when called with totalTime: 0', function() {
        this.view._setTotalTimeLabelText(0);
      });

      it('should not error when called with totalTime: >0', function() {
        this.view._setTotalTimeLabelText(1);
      });
    });
  });
});