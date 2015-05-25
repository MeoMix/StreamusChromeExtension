define(function(require) {
  'use strict';

  var PlayPauseSongButtonView = require('foreground/view/listItemButton/playPauseSongButtonView');
  var StreamItems = require('background/collection/streamItems');
  var Player = require('background/model/player');
  var ListItemButton = require('foreground/model/listItemButton/listItemButton');
  var Settings = require('background/model/settings');
  var YouTubePlayer = require('background/model/youTubePlayer');
  var Song = require('background/model/song');
  var viewTestUtility = require('test/foreground/view/viewTestUtility');

  describe('PlayPauseSongButtonView', function() {
    beforeEach(function() {
      this.documentFragment = document.createDocumentFragment();
      this.view = new PlayPauseSongButtonView({
        model: new ListItemButton(),
        song: new Song(),
        streamItems: new StreamItems(),
        player: new Player({
          settings: new Settings(),
          youTubePlayer: new YouTubePlayer()
        })
      });
    });

    afterEach(function() {
      this.view.destroy();
    });

    viewTestUtility.ensureBasicAssumptions.call(this);
  });
});