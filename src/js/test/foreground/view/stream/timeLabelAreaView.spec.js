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
  var testUtility = require('test/testUtility');

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
});