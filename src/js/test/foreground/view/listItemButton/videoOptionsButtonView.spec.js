define(function(require) {
  'use strict';

  var VideoOptionsButtonView = require('foreground/view/listItemButton/videoOptionsButtonView');
  var ListItemButton = require('foreground/model/listItemButton/listItemButton');
  var Video = require('background/model/video');
  var viewTestUtility = require('test/foreground/view/viewTestUtility');

  describe('VideoOptionsButtonView', function() {
    beforeEach(function() {
      this.documentFragment = document.createDocumentFragment();
      this.view = new VideoOptionsButtonView({
        model: new ListItemButton(),
        video: new Video(),
        player: TestUtility.buildPlayer()
      });
    });

    afterEach(function() {
      this.view.destroy();
    });

    viewTestUtility.ensureBasicAssumptions.call(this);
  });
});