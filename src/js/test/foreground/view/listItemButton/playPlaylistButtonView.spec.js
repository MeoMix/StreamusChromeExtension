'use strict';
import PlayPlaylistButtonView from 'foreground/view/listItemButton/playPlaylistButtonView';
import Playlist from 'background/model/playlist';
import ListItemButton from 'foreground/model/listItemButton/listItemButton';
import StreamItems from 'background/collection/streamItems';
import ViewTestUtility from 'test/foreground/view/viewTestUtility';

describe('PlayPlaylistButtonView', function() {
  beforeEach(function() {
    this.documentFragment = document.createDocumentFragment();
    this.view = new PlayPlaylistButtonView({
      model: new ListItemButton(),
      playlist: new Playlist(),
      streamItems: new StreamItems()
    });
  });

  afterEach(function() {
    this.view.destroy();
  });

  ViewTestUtility.ensureBasicAssumptions.call(this);
});