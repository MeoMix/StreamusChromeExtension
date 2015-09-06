import {LayoutView} from 'marionette';
import ViewEntityContainer from 'foreground/view/behavior/viewEntityContainer';

var TimeSliderView = LayoutView.extend({
  tagName: 'streamus-slider',
  className: 'slider-collapsedThumb',
  id: 'timeSlider',
  template: false,

  behaviors: {
    ViewEntityContainer: {
      behaviorClass: ViewEntityContainer,
      viewEntityNames: ['model']
    }
  },

  events: {
    'input': '_onInput',
    'mousedown': '_onMouseDown',
    'mouseup': '_onMouseUp'
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

  _onInput: function(event, value) {
    if (this.model.get('isEnabled')) {
      this.model.set('currentTime', value);

      // Stifle updating the player when dragging until the drag has finished.
      if (!this.model.get('isBeingDragged')) {
        this.player.seekTo(value);
      }
    }
  },

  _onMouseDown: function(event) {
    // 1 is primary mouse button, usually left
    if (this.model.get('isEnabled') && event.which === 1) {
      this.model.set('isBeingDragged', true);
    }
  },

  _onMouseUp: function(event) {
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
    this.$el.attr('max', totalTime);
  },

  // Repaints the progress bar's filled-in amount based on the % of time elapsed for current video.
  // Keep separate from render because a distinction is needed between the player's time and the
  // progress bar's time. The player's time should not update when the progress bar's time is
  // being dragged by the user, but the progress bar's values do need to update.
  _setTimeProgress: function(currentTime) {
    this.$el.val(currentTime);
  },

  _getTotalTime: function(loadedVideo) {
    var totalTime = _.isNull(loadedVideo) ? 0 : loadedVideo.get('duration');
    return totalTime;
  },

  _setEnabledState: function(isEnabled) {
    this.$el.toggleClass('is-disabled', !isEnabled);
  }
});

export default TimeSliderView;