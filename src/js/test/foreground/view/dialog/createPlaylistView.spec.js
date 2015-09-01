'use strict';
import CreatePlaylistView from 'foreground/view/dialog/createPlaylistView';
import CreatePlaylist from 'foreground/model/dialog/createPlaylist';
import Playlists from 'background/collection/playlists';
import DataSourceManager from 'background/model/dataSourceManager';
import TestUtility from 'test/testUtility';
import ViewTestUtility from 'test/foreground/view/viewTestUtility';

describe('CreatePlaylistView', function() {
  beforeEach(function() {
    this.documentFragment = document.createDocumentFragment();
    this.view = new CreatePlaylistView({
      model: new CreatePlaylist(),
      playlists: new Playlists([], {
        userId: TestUtility.getGuid()
      }),
      dataSourceManager: new DataSourceManager()
    });
  });

  afterEach(function() {
    this.view.destroy();
  });

  ViewTestUtility.ensureBasicAssumptions.call(this);
});