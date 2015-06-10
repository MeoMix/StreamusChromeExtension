define(function(require) {
  'use strict';

  var PlayerState = require('common/enum/playerState');
  var TimeSliderTemplate = require('text!template/stream/timeSlider.html');

  var TimeSliderView = Marionette.ItemView.extend({
    id: 'timeSlider',
    template: _.template(TimeSliderTemplate),

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

    modelEvents: {
      'change:currentTime': '_onChangeCurrentTime'
    },

    player: null,
    playerEvents: {
      'change:currentTime': '_onPlayerChangeCurrentTime',
      'change:state': '_onPlayerChangeState'
    },

    initialize: function(options) {
      this.player = options.player;
      this.bindEntityEvents(this.player, this.playerEvents);
    },

    onRender: function() {
      var totalTime = this._getTotalTime(this.player.get('loadedSong'));
      this._setTotalTime(totalTime);
      this._setCurrentTime(this.player.get('currentTime'));
    },

    _onInputTimeRange: function() {
      var currentTime = parseInt(this.ui.timeRange.val(), 10);
      this.model.set('currentTime', currentTime);
    },

    // Allow the user to manual time change by click or scroll.
    _onWheelTimeRange: function(event) {
      var delta = event.originalEvent.deltaY / -100;
      var currentTime = this.model.get('currentTime');
      var newTime = currentTime + delta;
      this.model.set('currentTime', currentTime + delta);
      this.player.seekTo(newTime);
    },

    _onMouseDownTimeRange: function(event) {
      // 1 is primary mouse button, usually left
      if (event.which === 1) {
        this._startDragging();
      }
    },

    _onMouseUpTimeRange: function(event) {
      // 1 is primary mouse button, usually left
      // It's important to check isBeingDragged here because onMouseUp can run even if onMouseDown did not fire.
      if (event.which === 1 && this.model.get('isBeingDragged')) {
        this.player.seekTo(this.model.get('currentTime'));
      }
    },

    _onChangeCurrentTime: function(model, currentTime) {
      this._updateTimeProgress(currentTime);
    },

    _onPlayerChangeState: function() {
      this._stopDragging();
    },

    _onPlayerChangeCurrentTime: function(model, currentTime) {
      var isBeingDragged = this.model.get('isBeingDragged');
      // If the time changes while user is dragging it then do not update the view because user's input should override it.
      if (!isBeingDragged) {
        this._setCurrentTime(currentTime);
      }
    },

    _startDragging: function() {
      this.model.set('isBeingDragged', true);
    },

    // TODO: Re-evaluate this logic. Feels weird.
    _stopDragging: function() {
      // Seek is known to have finished when the player announces a state change that isn't buffering / unstarted.
      var state = this.player.get('state');

      if (state === PlayerState.Playing || state === PlayerState.Paused) {
        this.model.set('isBeingDragged', false);
      }
    },

    _setTotalTime: function(totalTime) {
      this.ui.timeRange.attr('max', totalTime);
    },

    _setCurrentTime: function(currentTime) {
      this.ui.timeRange.val(currentTime);
      this._updateTimeProgress(currentTime);
    },

    // Repaints the progress bar's filled-in amount based on the % of time elapsed for current song.
    // Keep separate from render because a distinction is needed between the player's time and the
    // progress bar's time. The player's time should not update when the progress bar's time is
    // being dragged by the user, but the progress bar's values do need to update.
    _updateTimeProgress: function(currentTime) {
      var totalTime = this._getTotalTime(this.player.get('loadedSong'));
      var progressPercent = this._getProgressPercent(currentTime, totalTime);
      this.ui.timeProgress.width(progressPercent + '%');
    },

    // Returns a % value out of 100 for how much time has elapsed.
    _getProgressPercent: function(currentTime, totalTime) {
      var progressPercent = 0;

      // Guard against divide-by-zero
      if (totalTime !== 0) {
        progressPercent = currentTime / totalTime * 100;
      }

      return progressPercent;
    },

    _getTotalTime: function(loadedSong) {
      var totalTime = _.isNull(loadedSong) ? 0 : loadedSong.get('duration');
      return totalTime;
    }
  });

  return TimeSliderView;
});