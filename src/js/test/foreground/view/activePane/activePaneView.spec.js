import ActivePaneType from 'foreground/enum/activePaneType';
import ActivePaneView from 'foreground/view/activePane/activePaneView';
import ActivePane from 'foreground/model/activePane/activePane';
import StreamView from 'foreground/view/stream/streamView';
import ActivePlaylistAreaView from 'foreground/view/leftPane/activePlaylistAreaView';
import ViewTestUtility from 'test/foreground/view/viewTestUtility';

describe('ActivePaneView', function() {
  describe('PlaylistActivePaneView', function() {
    beforeEach(function() {
      this.documentFragment = document.createDocumentFragment();
      var stream = TestUtility.buildStream();

      this.view = new ActivePaneView({
        model: new ActivePane({
          type: ActivePaneType.Stream,
          relatedModel: stream
        }),
        streamItems: stream.get('items')
      });
    });

    afterEach(function() {
      this.view.destroy();
    });

    ViewTestUtility.ensureBasicAssumptions.call(this);

    describe('_getContentView', function() {
      it('should return a StreamView', function() {
        var contentView = this.view._getContentView();
        expect(contentView instanceof StreamView).to.equal(true);
      });
    });
  });

  describe('PlaylistActivePaneView', function() {
    beforeEach(function() {
      this.documentFragment = document.createDocumentFragment();
      var stream = TestUtility.buildStream();

      this.view = new ActivePaneView({
        model: new ActivePane({
          type: ActivePaneType.Playlist,
          relatedModel: TestUtility.buildPlaylist()
        }),
        streamItems: stream.get('items')
      });
    });

    afterEach(function() {
      this.view.destroy();
    });

    ViewTestUtility.ensureBasicAssumptions.call(this);

    describe('_getContentView', function() {
      it('should return a ActivePlaylistAreaView', function() {
        var contentView = this.view._getContentView();
        expect(contentView instanceof ActivePlaylistAreaView).to.equal(true);
      });
    });
  });
});