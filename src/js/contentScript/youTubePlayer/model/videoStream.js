define(function() {
  'use strict';

  var VideoStream = Backbone.Model.extend({
    defaults: {
      currentTime: 0
    },

    resetCurrentTime: function() {
      this.set('currentTime', this.defaults.currentTime);
    }
  });

  return VideoStream;
});