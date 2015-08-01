define(function(require) {
  'use strict';

  var PlayPauseVideoButtonView = require('foreground/view/listItemButton/playPauseVideoButtonView');
  var StreamItems = require('background/collection/streamItems');
  var ListItemButton = require('foreground/model/listItemButton/listItemButton');
  var Video = require('background/model/video');
  var viewTestUtility = require('test/foreground/view/viewTestUtility');

  describe('PlayPauseVideoButtonView', function() {
    beforeEach(function() {
      this.documentFragment = document.createDocumentFragment();
      this.view = new PlayPauseVideoButtonView({
        model: new ListItemButton(),
        video: new Video(),
        streamItems: new StreamItems(),
        player: TestUtility.buildPlayer()
      });
    });

    afterEach(function() {
      this.view.destroy();
    });

    viewTestUtility.ensureBasicAssumptions.call(this);
  });
});