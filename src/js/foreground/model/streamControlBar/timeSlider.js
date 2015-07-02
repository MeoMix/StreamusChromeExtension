define(function() {
  'use strict';

  var TimeSlider = Backbone.Model.extend({
    defaults: {
      currentTime: 0,
      isBeingDragged: false,
      isEnabled: false,
      player: null
    },

    initialize: function() {
      var player = this.get('player');
      this._setEnabledState(player.get('loadedSong'));
      this.listenTo(player, 'change:loadedSong', this._onPlayerChangeLoadedSong);
    },

    incrementCurrentTime: function(incrementValue) {
      var currentTime = this.get('currentTime');
      var incrementedCurrentTime = currentTime + incrementValue;
      this.set('currentTime', incrementedCurrentTime);

      return incrementedCurrentTime;
    },

    _onPlayerChangeLoadedSong: function(model, loadedSong) {
      this._setEnabledState(loadedSong);
    },

    _setEnabledState: function(loadedSong) {
      this.set('isEnabled', !_.isNull(loadedSong));
    }
  });

  return TimeSlider;
});