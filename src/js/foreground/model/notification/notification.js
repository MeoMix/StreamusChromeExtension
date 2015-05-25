define(function() {
  'use strict';

  var Notification = Backbone.Model.extend({
    defaults: {
      message: ''
    }
  });

  return Notification;
});