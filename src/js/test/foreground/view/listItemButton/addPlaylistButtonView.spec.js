'use strict';
import AddPlaylistButtonView from 'foreground/view/listItemButton/addPlaylistButtonView';
import Playlist from 'background/model/playlist';
import StreamItems from 'background/collection/streamItems';
import ListItemButton from 'foreground/model/listItemButton/listItemButton';
import ViewTestUtility from 'test/foreground/view/viewTestUtility';

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

  ViewTestUtility.ensureBasicAssumptions.call(this);
});