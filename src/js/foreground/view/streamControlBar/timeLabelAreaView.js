define(function(require) {
  'use strict';

  var Utility = require('common/utility');
  var Tooltipable = require('foreground/view/behavior/tooltipable');
  var TimeLabelAreaTemplate = require('text!template/streamControlBar/timeLabelArea.html');

  var TimeLabelArea = Marionette.LayoutView.extend({
    id: 'timeLabelArea',
    template: _.template(TimeLabelAreaTemplate),

    ui: {
      elapsedTimeLabel: 'elapsedTimeLabel',
      totalTimeLabel: 'totalTimeLabel'
    },

    behaviors: {
      Tooltipable: {
        behaviorClass: Tooltipable
      }
    },

    events: {
      'click @ui.elapsedTimeLabel': '_onClickElapsedTimeLabel'
    },

    modelEvents: {
      'change:showRemainingTime': '_onChangeShowRemainingTime'
    },

    timeSlider: null,
    timeSliderEvents: {
      'change:currentTime': '_onTimeSliderChangeCurrentTime'
    },

    player: null,
    playerEvents: {
      'change:loadedVideo': '_onPlayerChangeLoadedVideo'
    },

    initialize: function(options) {
      this.timeSlider = options.timeSlider;
      this.player = options.player;
      this.bindEntityEvents(this.timeSlider, this.timeSliderEvents);
      this.bindEntityEvents(this.player, this.playerEvents);
    },

    onRender: function() {
      var totalTime = this._getTotalTime(this.player.get('loadedVideo'));
      this._setTotalTimeLabelText(totalTime);
      this._setElapsedTimeLabelText(this.timeSlider.get('currentTime'));
      this._setElapsedTimeLabelTooltipText(this.model.get('showRemainingTime'));
    },

    _onTimeSliderChangeCurrentTime: function(model, currentTime) {
      this._setElapsedTimeLabelText(currentTime);
    },

    _onClickElapsedTimeLabel: function() {
      this.model.toggleShowRemainingTime();
    },

    _onChangeShowRemainingTime: function(model, showRemainingTime) {
      this._setElapsedTimeLabelTooltipText(showRemainingTime);
      this._setElapsedTimeLabelText(this.timeSlider.get('currentTime'));
    },

    _onPlayerChangeLoadedVideo: function(model, loadedVideo) {
      var totalTime = this._getTotalTime(loadedVideo);
      this._setTotalTimeLabelText(totalTime);

      // Since there's no loaded video the label could not possibly be anything other than 0.
      // This is important if remaining time is being shown and timeSlider's currentTime is 0 since
      // changing the loadedVideo to null won't trigger a change event on timerSlider's currentTime
      if (_.isNull(loadedVideo)) {
        this._setElapsedTimeLabelText(0);
      }
    },

    _getTotalTime: function(loadedVideo) {
      var totalTime = _.isNull(loadedVideo) ? 0 : loadedVideo.get('duration');
      return totalTime;
    },

    // Update the tooltip's text to reflect whether remaining or elapsed time is being shown.
    _setElapsedTimeLabelTooltipText: function(showRemainingTime) {
      var tooltipText = chrome.i18n.getMessage(showRemainingTime ? 'remainingTime' : 'elapsedTime');
      this.ui.elapsedTimeLabel.attr('data-tooltip-text', tooltipText);
    },

    // Update the value of elapsedTimeLabel to the timeSlider's current time or
    // the difference between the total time and the current time.
    // This value is not guaranteed to reflect the player's current time as the user could be
    // dragging the time slider which will cause the label to represent a different value.
    _setElapsedTimeLabelText: function(currentTime) {
      var showRemainingTime = this.model.get('showRemainingTime');
      var totalTime = this._getTotalTime(this.player.get('loadedVideo'));
      var elapsedTime = this._getElapsedTime(currentTime, totalTime, showRemainingTime);

      // Elapsed time can be set very frequently. Use the most optimized version of modifying the text.
      this.ui.elapsedTimeLabel[0].textContent = Utility.prettyPrintTime(elapsedTime);
    },

    _getElapsedTime: function(currentTime, totalTime, showRemainingTime) {
      var elapsedTime = showRemainingTime ? totalTime - currentTime : currentTime;
      return elapsedTime;
    },

    _setTotalTimeLabelText: function(totalTime) {
      this.ui.totalTimeLabel.text(Utility.prettyPrintTime(totalTime));
    }
  });

  return TimeLabelArea;
});