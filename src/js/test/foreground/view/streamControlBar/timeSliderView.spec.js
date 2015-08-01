define(function(require) {
  'use strict';

  var TimeSliderView = require('foreground/view/streamControlBar/timeSliderView');
  var TimeSlider = require('foreground/model/streamControlBar/timeSlider');
  var StreamItems = require('background/collection/streamItems');
  var viewTestUtility = require('test/foreground/view/viewTestUtility');

  describe('TimeSliderView', function() {
    beforeEach(function() {
      this.documentFragment = document.createDocumentFragment();
      var player = TestUtility.buildPlayer();

      this.view = new TimeSliderView({
        model: new TimeSlider({
          currentTime: player.get('currentTime'),
          player: player
        }),
        streamItems: new StreamItems(),
        player: player
      });
    });

    afterEach(function() {
      this.view.destroy();
    });

    viewTestUtility.ensureBasicAssumptions.call(this);

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

    describe('_getProgressPercent', function() {
      it('should return 0 when attempting to divide-by-zero', function() {
        var progressPercent = this.view._getProgressPercent(0, 0);
        expect(progressPercent).to.equal(0);
      });

      it('should return a valid percent value', function() {
        var progressPercent = this.view._getProgressPercent(10, 100);
        expect(progressPercent).to.equal(10);
      });
    });

    describe('_onPlayerChangeCurrentTime', function() {
      it('should set the models currentTime property if not being dragged', function() {
        this.view.model.set('isBeingDragged', false);
        sinon.stub(this.view.model, 'set');
        this.view._onPlayerChangeCurrentTime();
        expect(this.view.model.set.calledOnce).to.equal(true);
        this.view.model.set.restore();
      });

      it('should not set the models currentTime property if it is being dragged', function() {
        this.view.model.set('isBeingDragged', true);
        sinon.stub(this.view.model, 'set');
        this.view._onPlayerChangeCurrentTime();
        expect(this.view.model.set.called).to.equal(false);
        this.view.model.set.restore();
      });
    });

    describe('when rendered', function() {
      beforeEach(function() {
        this.view.render();
      });

      describe('_onInputTimeRange', function() {
        it('should set the model to the currentTime if the model is enabled', function() {
          this.view.model.set('isEnabled', true);
          sinon.stub(this.view.model, 'set');
          this.view._onInputTimeRange();
          expect(this.view.model.set.calledOnce).to.equal(true);
          this.view.model.set.restore();
        });

        it('should not set the model to the currentTime if the model is disabled', function() {
          this.view.model.set('isEnabled', false);
          sinon.stub(this.view.model, 'set');
          this.view._onInputTimeRange();
          expect(this.view.model.set.calledOnce).to.equal(false);
          this.view.model.set.restore();
        });
      });

      describe('_onWheelTimeRange', function() {
        it('should do nothing if the model is not enabled', function() {
          this.view.model.set('isEnabled', false);

          sinon.stub(this.view.model, 'incrementCurrentTime');

          this.view._onWheelTimeRange({
            originalEvent: {
              deltaY: -100
            }
          });

          expect(this.view.model.incrementCurrentTime.called).to.equal(false);

          this.view.model.incrementCurrentTime.restore();
        });

        it('should tell the model to increment its currentTime', function() {
          this.view.model.set('isEnabled', true);

          sinon.stub(this.view.model, 'incrementCurrentTime');
          sinon.stub(this.view.player, 'seekTo');

          this.view._onWheelTimeRange({
            originalEvent: {
              deltaY: -100
            }
          });

          expect(this.view.model.incrementCurrentTime.calledOnce).to.equal(true);
          expect(this.view.model.incrementCurrentTime.calledWith(1)).to.equal(true);

          this.view.model.incrementCurrentTime.restore();
          this.view.player.seekTo.restore();
        });

        it('should tell the player to seek to the incremented time', function() {
          this.view.model.set('isEnabled', true);
          sinon.stub(this.view.player, 'seekTo');
          this.view._onWheelTimeRange({
            originalEvent: {
              deltaY: -100
            }
          });

          expect(this.view.player.seekTo.calledOnce).to.equal(true);
          expect(this.view.player.seekTo.calledWith(1)).to.equal(true);

          this.view.player.seekTo.restore();
        });
      });

      describe('_setTimeProgress', function() {
        it('should not error when called', function() {
          this.view._setTimeProgress(0);
        });
      });

      describe('_setTotalTime', function() {
        it('should not error when called', function() {
          this.view._setTotalTime(0);
        });
      });
    });
  });
});