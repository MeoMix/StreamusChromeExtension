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

    xdescribe('_onInputTimeRange', function() {

    });

    xdescribe('_onWheelTimeRange', function() {

    });

    xdescribe('_onMouseDownTimeRange', function() {

    });

    xdescribe('_startDragging', function() {

    });

    xdescribe('_stopDragging', function() {

    });

    describe('_onPlayerChangeCurrentTime', function() {
      beforeEach(function() {
        sinon.stub(this.view, '_setCurrentTime');
      });

      afterEach(function() {
        this.view._setCurrentTime.restore();
      });

      it('should call _setCurrentTime if the model is not being dragged', function() {
        this.view.model.set('isBeingDragged', false);
        this.view._onPlayerChangeCurrentTime();
        expect(this.view._setCurrentTime.called).to.equal(true);
      });

      it('should not call _setCurrentTime if the model is being dragged', function() {
        this.view.model.set('isBeingDragged', true);
        this.view._onPlayerChangeCurrentTime();
        expect(this.view._setCurrentTime.called).to.equal(false);
      });
    });

    describe('when rendered', function() {
      beforeEach(function() {
        this.view.render();
      });

      describe('_updateTimeProgress', function() {
        it('should not error when called', function() {
          this.view._updateTimeProgress(0);
        });
      });

      describe('_setTotalTime', function() {
        it('should not error when called', function() {
          this.view._setTotalTime(0);
        });
      });

      describe('_setCurrentTime', function() {
        it('should not error when called', function() {
          this.view._setCurrentTime(0);
        });
      });
    });
  });
});