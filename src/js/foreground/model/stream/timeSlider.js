define(function() {
  'use strict';

  var TimeRange = Backbone.Model.extend({
    defaults: {
      currentTime: 0,
      isBeingDragged: false
    },

    incrementCurrentTime: function(incrementValue) {
      var currentTime = this.get('currentTime');
      var incrementedCurrentTime = currentTime + incrementValue;
      this.set('currentTime', incrementedCurrentTime);

      return incrementedCurrentTime;
    }
  });

  return TimeRange;
});