'use strict';
import EditPlaylistView from 'foreground/view/dialog/editPlaylistView';
import EditPlaylist from 'foreground/model/dialog/editPlaylist';
import ViewTestUtility from 'test/foreground/view/viewTestUtility';

describe('EditPlaylistView', function() {
  beforeEach(function() {
    this.documentFragment = document.createDocumentFragment();
    this.view = new EditPlaylistView({
      model: new EditPlaylist({
        playlist: TestUtility.buildPlaylist()
      })
    });
  });

  afterEach(function() {
    this.view.destroy();
  });

  ViewTestUtility.ensureBasicAssumptions.call(this);
});