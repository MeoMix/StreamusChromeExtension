define(function(require) {
  'use strict';

  var AddPlaylistButtonView = require('foreground/view/listItemButton/addPlaylistButtonView');
  var Playlist = require('background/model/playlist');
  var StreamItems = require('background/collection/streamItems');
  var ListItemButton = require('foreground/model/listItemButton/listItemButton');
  var viewTestUtility = require('test/foreground/view/viewTestUtility');

  describe('AddPlaylistButtonView', function() {
    beforeEach(function() {
      this.documentFragment = document.createDocumentFragment();
      this.view = new AddPlaylistButtonView({
        model: new ListItemButton(),
        playlist: new Playlist(),
        streamItems: new StreamItems()
      });
    });

    afterEach(function() {
      this.view.destroy();
    });

    viewTestUtility.ensureBasicAssumptions.call(this);
  });
});