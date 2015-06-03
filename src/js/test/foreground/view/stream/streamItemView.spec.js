define(function(require) {
  'use strict';

  var StreamItemView = require('foreground/view/stream/streamItemView');
  var StreamItem = require('background/model/streamItem');
  var StreamItems = require('background/collection/streamItems');
  var Player = require('background/model/player');
  var Settings = require('background/model/settings');
  var YouTubePlayer = require('background/model/youTubePlayer');
  var PlayPauseButton = require('background/model/playPauseButton');
  var ListItemType = require('common/enum/listItemType');
  var viewTestUtility = require('test/foreground/view/viewTestUtility');

  describe('StreamItemView', function() {
    beforeEach(function() {
      this.documentFragment = document.createDocumentFragment();

      var player = new Player({
        settings: new Settings(),
        youTubePlayer: new YouTubePlayer()
      });

      this.view = new StreamItemView({
        model: new StreamItem(),
        player: player,
        playPauseButton: new PlayPauseButton({
          player: player,
          streamItems: new StreamItems()
        }),
        type: ListItemType.StreamItem,
        parentId: 'streamItems-list'
      });
    });

    afterEach(function() {
      this.view.destroy();
    });

    viewTestUtility.ensureBasicAssumptions.call(this);
  });
});