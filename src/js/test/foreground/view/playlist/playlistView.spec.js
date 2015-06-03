define(function(require) {
  'use strict';

  var PlaylistView = require('foreground/view/playlist/playlistView');
  var Playlist = require('background/model/playlist');
  var ListItemType = require('common/enum/listItemType');
  var viewTestUtility = require('test/foreground/view/viewTestUtility');

  describe('PlaylistView', function() {
    beforeEach(function() {
      this.documentFragment = document.createDocumentFragment();
      this.view = new PlaylistView({
        model: new Playlist(),
        type: ListItemType.Playlist,
        parentId: 'playlists-list'
      });
    });

    afterEach(function() {
      this.view.destroy();
    });

    viewTestUtility.ensureBasicAssumptions.call(this);
  });
});