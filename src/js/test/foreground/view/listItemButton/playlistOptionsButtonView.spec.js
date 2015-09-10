import PlaylistOptionsButtonView from 'foreground/view/listItemButton/playlistOptionsButtonView';
import ListItemButton from 'foreground/model/listItemButton/listItemButton';
import Playlist from 'background/model/playlist';
import ViewTestUtility from 'test/foreground/view/viewTestUtility';

describe('PlaylistOptionsButtonView', function() {
  beforeEach(function() {
    this.documentFragment = document.createDocumentFragment();
    this.view = new PlaylistOptionsButtonView({
      model: new ListItemButton(),
      playlist: new Playlist()
    });
  });

  afterEach(function() {
    this.view.destroy();
  });

  ViewTestUtility.ensureBasicAssumptions.call(this);
});