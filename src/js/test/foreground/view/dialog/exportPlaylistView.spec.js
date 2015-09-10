import ExportPlaylist from 'foreground/model/dialog/exportPlaylist';
import ExportPlaylistView from 'foreground/view/dialog/exportPlaylistView';
import ViewTestUtility from 'test/foreground/view/viewTestUtility';

describe('ExportPlaylistView', function() {
  beforeEach(function() {
    this.documentFragment = document.createDocumentFragment();
    this.view = new ExportPlaylistView({
      model: new ExportPlaylist({
        playlist: TestUtility.buildPlaylist()
      })
    });
  });

  afterEach(function() {
    this.view.destroy();
  });

  ViewTestUtility.ensureBasicAssumptions.call(this);
});