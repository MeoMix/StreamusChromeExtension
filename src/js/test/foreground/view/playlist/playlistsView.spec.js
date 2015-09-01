'use strict';
import PlaylistsView from 'foreground/view/playlist/playlistsView';
import Playlists from 'background/collection/playlists';
import ViewTestUtility from 'test/foreground/view/viewTestUtility';

describe('PlaylistsView', function() {
  beforeEach(function() {
    this.documentFragment = document.createDocumentFragment();
    this.view = new PlaylistsView({
      collection: new Playlists()
    });
  });

  afterEach(function() {
    this.view.destroy();
  });

  ViewTestUtility.ensureBasicAssumptions.call(this);
});