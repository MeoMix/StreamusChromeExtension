define(function() {
  'use strict';

  var VideoStream = Backbone.Model.extend({
    defaults: {
      currentTime: 0,
      muted: false,
      volume: 50,
      suggestedQuality: 'default'
    }
  });

  return VideoStream;
});