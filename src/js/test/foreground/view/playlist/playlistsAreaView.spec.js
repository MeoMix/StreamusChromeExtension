'use strict';
import PlaylistsAreaView from 'foreground/view/playlist/playlistsAreaView';
import Playlists from 'background/collection/playlists';
import ViewTestUtility from 'test/foreground/view/viewTestUtility';

describe('PlaylistsAreaView', function() {
  beforeEach(function() {
    this.documentFragment = document.createDocumentFragment();
    this.view = new PlaylistsAreaView({
      playlists: new Playlists()
    });
  });

  afterEach(function() {
    this.view.destroy();
  });

  ViewTestUtility.ensureBasicAssumptions.call(this);
});