import DeletePlaylistView from 'foreground/view/dialog/deletePlaylistView';
import ViewTestUtility from 'test/foreground/view/viewTestUtility';

describe('DeletePlaylistView', function() {
  beforeEach(function() {
    this.documentFragment = document.createDocumentFragment();
    this.view = new DeletePlaylistView({
      model: TestUtility.buildPlaylist()
    });
  });

  afterEach(function() {
    this.view.destroy();
  });

  ViewTestUtility.ensureBasicAssumptions.call(this);

  it('should destroy its model when calling deletePlaylist', function() {
    sinon.stub(this.view.model, 'destroy');

    this.view.deletePlaylist();
    expect(this.view.model.destroy.calledOnce).to.equal(true);

    this.view.model.destroy.restore();
  });
});