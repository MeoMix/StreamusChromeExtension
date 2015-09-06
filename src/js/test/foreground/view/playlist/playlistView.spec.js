import PlaylistView from 'foreground/view/playlist/playlistView';
import Playlist from 'background/model/playlist';
import ListItemType from 'common/enum/listItemType';
import ViewTestUtility from 'test/foreground/view/viewTestUtility';

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

  ViewTestUtility.ensureBasicAssumptions.call(this);
});