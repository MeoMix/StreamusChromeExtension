define(function(require) {
  'use strict';

  var Utility = require('common/utility');
  var Tooltipable = require('foreground/view/behavior/tooltipable');
  var TimeLabelAreaTemplate = require('text!template/stream/timeLabelArea.html');

  var TimeLabelArea = Marionette.LayoutView.extend({
    id: 'timeLabelArea',
    template: _.template(TimeLabelAreaTemplate),

    ui: {
      elapsedTimeLabel: '[data-ui~=elapsedTimeLabel]',
      totalTimeLabel: '[data-ui~=totalTimeLabel]'
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
      'change:loadedSong': '_onPlayerChangeLoadedSong'
    },

    initialize: function(options) {
      this.timeSlider = options.timeSlider;
      this.player = options.player;
      this.bindEntityEvents(this.timeSlider, this.timeSliderEvents);
      this.bindEntityEvents(this.player, this.playerEvents);
    },

    onRender: function() {
      var totalTime = this._getTotalTime(this.player.get('loadedSong'));
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

    _onPlayerChangeLoadedSong: function(model, loadedSong) {
      var totalTime = this._getTotalTime(loadedSong);
      this._setTotalTimeLabelText(totalTime);
    },

    _getTotalTime: function(loadedSong) {
      var totalTime = _.isNull(loadedSong) ? 0 : loadedSong.get('duration');
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
      var totalTime = this._getTotalTime(this.player.get('loadedSong'));
      var elapsedTime = this._getElapsedTime(currentTime, totalTime, showRemainingTime);

      this.ui.elapsedTimeLabel.text(Utility.prettyPrintTime(elapsedTime));
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