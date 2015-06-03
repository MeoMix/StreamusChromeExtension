define(function() {
  'use strict';

  var EditPlaylist = Backbone.Model.extend({
    defaults: {
      playlist: null,
      valid: true
    }
  });

  return EditPlaylist;
});