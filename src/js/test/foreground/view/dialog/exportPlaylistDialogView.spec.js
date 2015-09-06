import ExportPlaylist from 'foreground/model/dialog/exportPlaylist';
import ExportPlaylistDialogView from 'foreground/view/dialog/exportPlaylistDialogView';
import ViewTestUtility from 'test/foreground/view/viewTestUtility';

describe('ExportPlaylistDialogView', function() {
  beforeEach(function() {
    this.documentFragment = document.createDocumentFragment();
    this.view = new ExportPlaylistDialogView({
      model: new ExportPlaylist({
        playlist: TestUtility.buildPlaylist()
      })
    });
  });

  afterEach(function() {
    this.view.destroy();
  });

  ViewTestUtility.ensureBasicAssumptions.call(this);

  describe('onSubmit', function() {
    it('should export its playlist', function() {
      sinon.stub(this.view.contentView, 'saveAndExport');

      this.view.onSubmit();
      expect(this.view.contentView.saveAndExport.calledOnce).to.equal(true);

      this.view.contentView.saveAndExport.restore();
    });
  });
});