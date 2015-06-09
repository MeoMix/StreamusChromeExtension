define(function(require) {
  'use strict';

  var PlayerState = require('common/enum/playerState');
  var Utility = require('common/utility');
  var Tooltipable = require('foreground/view/behavior/tooltipable');
  var TimeSliderTemplate = require('text!template/stream/timeSlider.html');

  var TimeSliderView = Marionette.ItemView.extend({
    id: 'timeSlider',
    className: 'timeSlider',
    template: _.template(TimeSliderTemplate),
    templateHelpers: function() {
      return {
        totalTime: this.model.get('totalTime'),
        prettyTotalTime: Utility.prettyPrintTime(this.model.get('totalTime'))
      };
    },

    ui: {
      timeProgress: '[data-ui~=timeProgress]',
      timeRange: '[data-ui~=timeRange]'
    },

    events: {
      'input @ui.timeRange': '_onInputTimeRange',
      'wheel @ui.timeRange': '_onWheelTimeRange',
      'mousedown @ui.timeRange': '_onMouseDownTimeRange',
      'mouseup @ui.timeRange': '_onMouseUpTimeRange'
    },

    behaviors: {
      Tooltipable: {
        behaviorClass: Tooltipable
      }
    },

    streamItems: null,
    player: null,

    playerEvents: {
      'change:currentTime': '_onPlayerChangeCurrentTime',
      'change:state': '_onPlayerChangeState'
    },

    initialize: function(options) {
      this.streamItems = options.streamItems;
      this.player = options.player;

      this.bindEntityEvents(this.player, this.playerEvents);
    },

    onRender: function() {
      this._setCurrentTime(this.player.get('currentTime'));
    },

    _onInputTimeRange: function() {
      this._updateTimeProgress();
    },

    // Allow the user to manual time change by click or scroll.
    _onWheelTimeRange: function(event) {
      var delta = event.originalEvent.deltaY / -100;
      var currentTime = parseInt(this.ui.timeRange.val(), 10);

      this._setCurrentTime(currentTime + delta);

      this.player.seekTo(currentTime + delta);
    },

    _onMouseDownTimeRange: function(event) {
      // 1 is primary mouse button, usually left
      if (event.which === 1) {
        this._startSeeking();
      }
    },

    _onMouseUpTimeRange: function(event) {
      // 1 is primary mouse button, usually left
      // It's important to check seeking here because onMouseUp can run even if onMouseDown did not fire.
      if (event.which === 1 && this.model.get('seeking')) {
        this._seekToCurrentTime();
      }
    },

    _onPlayerChangeState: function() {
      this._stopSeeking();
    },

    _onPlayerChangeCurrentTime: function(model, currentTime) {
      this._updateCurrentTime(currentTime);
    },

    _startSeeking: function() {
      this.model.set('seeking', true);
    },

    _stopSeeking: function() {
      // Seek is known to have finished when the player announces a state change that isn't buffering / unstarted.
      var state = this.player.get('state');

      if (state === PlayerState.Playing || state === PlayerState.Paused) {
        this.model.set('seeking', false);
      }
    },

    _seekToCurrentTime: function() {
      // Bind to progressBar mouse-up to support dragging as well as clicking.
      // I don't want to send a message until drag ends, so mouseup works nicely.
      var currentTime = parseInt(this.ui.timeRange.val(), 10);
      this.player.seekTo(currentTime);
    },

    _setCurrentTime: function(currentTime) {
      this.ui.timeRange.val(currentTime);
      this._updateTimeProgress();
    },

    _updateCurrentTime: function(currentTime) {
      var seeking = this.model.get('seeking');
      // If the time changes while user is seeking then do not update the view because user's input should override it.
      if (!seeking) {
        this._setCurrentTime(currentTime);
      }
    },

    // Repaints the progress bar's filled-in amount based on the % of time elapsed for current song.
    // Keep separate from render because a distinction is needed between the player's time and the
    // progress bar's time. The player's time should not update when the progress bar's time is
    // being dragged by the user, but the progress bar's values do need to update.
    _updateTimeProgress: function() {
      var currentTime = parseInt(this.ui.timeRange.val(), 10);
      var totalTime = parseInt(this.ui.timeRange.prop('max'), 10);

      // Don't divide by 0.
      var progressPercent = totalTime === 0 ? 0 : currentTime * 100 / totalTime;
      this.ui.timeProgress.width(progressPercent + '%');
    }
  });

  return TimeSliderView;
});