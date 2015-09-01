'use strict';
import CreatePlaylistDialogView from 'foreground/view/dialog/createPlaylistDialogView';
import Playlists from 'background/collection/playlists';
import ViewTestUtility from 'test/foreground/view/viewTestUtility';

describe('CreatePlaylistDialogView', function() {
  beforeEach(function() {
    this.documentFragment = document.createDocumentFragment();
    this.view = new CreatePlaylistDialogView({
      playlists: new Playlists()
    });
  });

  afterEach(function() {
    this.view.destroy();
  });

  ViewTestUtility.ensureBasicAssumptions.call(this);

  describe('onSubmit', function() {
    it('should create a playlist', function() {
      sinon.stub(this.view.contentView, 'createPlaylist');

      this.view.onSubmit();
      expect(this.view.contentView.createPlaylist.calledOnce).to.equal(true);

      this.view.contentView.createPlaylist.restore();
    });
  });
});