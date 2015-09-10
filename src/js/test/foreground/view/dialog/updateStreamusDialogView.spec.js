import UpdateStreamusDialogView from 'foreground/view/dialog/updateStreamusDialogView';
import ViewTestUtility from 'test/foreground/view/viewTestUtility';

describe('UpdateStreamusDialogView', function() {
  beforeEach(function() {
    this.documentFragment = document.createDocumentFragment();
    this.view = new UpdateStreamusDialogView();
  });

  afterEach(function() {
    this.view.destroy();
  });

  ViewTestUtility.ensureBasicAssumptions.call(this);

  describe('onSubmit', function() {
    it('should reload the extension', function() {
      sinon.stub(chrome.runtime, 'reload');

      this.view.onSubmit();
      expect(chrome.runtime.reload.calledOnce).to.equal(true);

      chrome.runtime.reload.restore();
    });
  });
});