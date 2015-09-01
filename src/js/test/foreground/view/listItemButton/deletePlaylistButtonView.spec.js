'use strict';
import DeletePlaylistButtonView from 'foreground/view/listItemButton/deletePlaylistButtonView';
import Playlist from 'background/model/playlist';
import ListItemButton from 'foreground/model/listItemButton/listItemButton';
import ViewTestUtility from 'test/foreground/view/viewTestUtility';

describe('DeletePlaylistButtonView', function() {
  beforeEach(function() {
    this.documentFragment = document.createDocumentFragment();
    this.view = new DeletePlaylistButtonView({
      model: new ListItemButton(),
      playlist: new Playlist()
    });
  });

  afterEach(function() {
    this.view.destroy();
  });

  ViewTestUtility.ensureBasicAssumptions.call(this);
});