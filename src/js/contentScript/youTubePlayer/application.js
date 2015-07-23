define(function(require) {
  'use strict';

  var YouTubePlayerView = require('view/youTubePlayerView');
  var Port = require('model/port');

  var Application = Marionette.Application.extend({
    initialize: function() {
      this.on('start', this._onStart);
    },

    _onStart: function() {
      this.port = new Port();
      this.port.connect();

      $(document).ready(function() {
        var youTubePlayerView = new YouTubePlayerView();
        youTubePlayerView.render();
      });
    }
  });

  return Application;
});