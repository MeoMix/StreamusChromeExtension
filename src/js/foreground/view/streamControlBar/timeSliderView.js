define(function(require) {
  'use strict';

  var ViewModelContainer = require('foreground/view/behavior/viewModelContainer');
  var TimeSliderTemplate = require('text!template/streamControlBar/timeSlider.html');

  var TimeSliderView = Marionette.LayoutView.extend({
    id: 'timeSlider',
    template: _.template(TimeSliderTemplate),

    useCustomUiSelector: false,
    ui: {
      timeProgress: 'timeProgress',
      timeRange: 'timeRange'
    },

    behaviors: {
      ViewModelContainer: {
        behaviorClass: ViewModelContainer,
        viewModelNames: ['model']
      }
    },

    events: {
      'input @ui.timeRange': '_onInputTimeRange',
      'wheel @ui.timeRange': '_onWheelTimeRange',
      'mousedown @ui.timeRange': '_onMouseDownTimeRange',
      'mouseup @ui.timeRange': '_onMouseUpTimeRange'
    },

    modelEvents: {
      'change:currentTime': '_onChangeCurrentTime',
      'change:isEnabled': '_onChangeIsEnabled'
    },

    player: null,
    playerEvents: {
      'change:currentTime': '_onPlayerChangeCurrentTime',
      'change:loadedVideo': '_onPlayerChangeLoadedVideo'
    },

    initialize: function(options) {
      this.player = options.player;
      this.bindEntityEvents(this.player, this.playerEvents);
    },

    onRender: function() {
      this._setEnabledState(this.model.get('isEnabled'));

      var loadedVideo = this.player.get('loadedVideo');
      var totalTime = this._getTotalTime(loadedVideo);
      this._setTotalTime(totalTime);
      this._setTimeProgress(this.player.get('currentTime'));
    },

    _onInputTimeRange: function() {
      if (this.model.get('isEnabled')) {
        var currentTime = parseInt(this.ui.timeRange.val(), 10);
        this.model.set('currentTime', currentTime);
      }
    },

    // Allow the user to manual time change by click or scroll.
    _onWheelTimeRange: function(event) {
      if (this.model.get('isEnabled')) {
        var delta = event.originalEvent.deltaY / -100;
        var incrementedTime = this.model.incrementCurrentTime(delta);
        this.player.seekTo(incrementedTime);
      }
    },

    _onMouseDownTimeRange: function(event) {
      // 1 is primary mouse button, usually left
      if (this.model.get('isEnabled') && event.which === 1) {
        this.model.set('isBeingDragged', true);
      }
    },

    _onMouseUpTimeRange: function(event) {
      // 1 is primary mouse button, usually left
      // It's important to check isBeingDragged here because onMouseUp can run even if onMouseDown did not fire.
      if (this.model.get('isEnabled') && event.which === 1 && this.model.get('isBeingDragged')) {
        this.model.set('isBeingDragged', false);
        this.player.seekTo(this.model.get('currentTime'));
      }
    },

    _onChangeCurrentTime: function(model, currentTime) {
      this._setTimeProgress(currentTime);
    },

    _onChangeIsEnabled: function(model, isEnabled) {
      this._setEnabledState(isEnabled);
    },

    _onPlayerChangeLoadedVideo: function(model, loadedVideo) {
      var totalTime = this._getTotalTime(loadedVideo);
      this._setTotalTime(totalTime);
      this._setEnabledState(loadedVideo);
    },

    _onPlayerChangeCurrentTime: function(model, currentTime) {
      var isBeingDragged = this.model.get('isBeingDragged');
      var isPlayerSeeking = this.player.get('seeking');

      // If the time changes while user is dragging it then do not update the view because user's input should override it.
      // There's also a point in time where the user has stopped dragging, and the player is responding to the seekTo request,
      // but it has not yet fulfilled the seek. During this time, if the player's time changes, the currentTime will stutter
      // back to the previous value. Prevent this by checking if the player is currently seeking.
      if (!isBeingDragged && !isPlayerSeeking) {
        this.model.set('currentTime', currentTime);
      }
    },

    _setTotalTime: function(totalTime) {
      this.ui.timeRange.attr('max', totalTime);
    },

    // Repaints the progress bar's filled-in amount based on the % of time elapsed for current video.
    // Keep separate from render because a distinction is needed between the player's time and the
    // progress bar's time. The player's time should not update when the progress bar's time is
    // being dragged by the user, but the progress bar's values do need to update.
    _setTimeProgress: function(currentTime) {
      this.ui.timeRange.val(currentTime);

      var totalTime = this._getTotalTime(this.player.get('loadedVideo'));
      var progressPercent = this._getProgressPercent(currentTime, totalTime);
      // TODO: The thumb for this gets slightly maligned at the end of the video.
      this.ui.timeProgress.css('transform', 'scaleX(' + progressPercent / 100 + ')');
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

    _getTotalTime: function(loadedVideo) {
      var totalTime = _.isNull(loadedVideo) ? 0 : loadedVideo.get('duration');
      return totalTime;
    },

    _setEnabledState: function(isEnabled) {
      this.ui.timeRange.toggleClass('is-disabled', !isEnabled);
    }
  });

  return TimeSliderView;
});