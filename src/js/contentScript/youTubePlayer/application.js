'use strict';
import {Application} from 'marionette';
import YouTubePlayerView from 'contentScript/youTubePlayer/view/youTubePlayerView';
import Port from 'contentScript/youTubePlayer/model/port';

var YouTubePlayerApplication = Application.extend({
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

export default YouTubePlayerApplication;