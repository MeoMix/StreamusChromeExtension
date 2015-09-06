import ActivePlaylistAreaView from 'foreground/view/leftPane/activePlaylistAreaView';
import Playlist from 'background/model/playlist';
import StreamItems from 'background/collection/streamItems';
import ViewTestUtility from 'test/foreground/view/viewTestUtility';

describe('ActivePlaylistAreaView', function() {
  beforeEach(function() {
    this.documentFragment = document.createDocumentFragment();

    var playlist = new Playlist();
    this.view = new ActivePlaylistAreaView({
      model: playlist,
      collection: playlist.get('items'),
      streamItems: new StreamItems()
    });
  });

  afterEach(function() {
    this.view.destroy();
  });

  ViewTestUtility.ensureBasicAssumptions.call(this);
});