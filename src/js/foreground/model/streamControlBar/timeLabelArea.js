define(function() {
  'use strict';

  var TimeLabelArea = Backbone.Model.extend({
    localStorage: new Backbone.LocalStorage('TimeLabelArea'),

    defaults: {
      // Need to set the ID for Backbone.LocalStorage
      id: 'TimeLabelArea',
      showRemainingTime: false
    },

    initialize: function() {
      // Load from Backbone.LocalStorage
      this.fetch();
    },

    toggleShowRemainingTime: function() {
      var showRemainingTime = this.get('showRemainingTime');
      this.save('showRemainingTime', !showRemainingTime);
    }
  });

  return TimeLabelArea;
});