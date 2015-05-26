define(function(require) {
  'use strict';

  var SongOptionsButtonView = require('foreground/view/listItemButton/songOptionsButtonView');
  var ListItemButton = require('foreground/model/listItemButton/listItemButton');
  var Player = require('background/model/player');
  var Settings = require('background/model/settings');
  var YouTubePlayer = require('background/model/youTubePlayer');
  var Song = require('background/model/song');
  var viewTestUtility = require('test/foreground/view/viewTestUtility');

  describe('SongOptionsButtonView', function() {
    beforeEach(function() {
      this.documentFragment = document.createDocumentFragment();
      this.view = new SongOptionsButtonView({
        model: new ListItemButton(),
        song: new Song(),
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