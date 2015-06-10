define(function(require) {
  'use strict';

  var TimeSliderView = require('foreground/view/stream/timeSliderView');
  var TimeSlider = require('foreground/model/stream/timeSlider');
  var StreamItems = require('background/collection/streamItems');
  var Player = require('background/model/player');
  var Settings = require('background/model/settings');
  var YouTubePlayer = require('background/model/youTubePlayer');
  var viewTestUtility = require('test/foreground/view/viewTestUtility');
  var testUtility = require('test/testUtility');

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

    describe('_getTotalTime', function() {
      it('should return 0 if there is no loaded song', function() {
        var totalTime = this.view._getTotalTime(null);
        expect(totalTime).to.equal(0);
      });

      it('should return the songs duration if it exists', function() {
        var song = testUtility.buildSong();
        var totalTime = this.view._getTotalTime(song);
        expect(totalTime).to.equal(song.get('duration'));
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
        it('should set the model to the currentTime', function() {
          sinon.stub(this.view.model, 'set');
          this.view._onInputTimeRange();
          expect(this.view.model.set.calledOnce).to.equal(true);
          this.view.model.set.restore();
        });
      });

      describe('_onWheelTimeRange', function() {
        it('should tell the model to increment its currentTime', function() {
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