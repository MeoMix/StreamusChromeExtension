define(function() {
  'use strict';

  var TimeRange = Backbone.Model.extend({
    defaults: {
      currentTime: 0,
      isBeingDragged: false
    }
  });

  return TimeRange;
});