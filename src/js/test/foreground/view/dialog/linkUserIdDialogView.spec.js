import LinkUserIdDialogView from 'foreground/view/dialog/linkUserIdDialogView';
import SignInManager from 'background/model/signInManager';
import ViewTestUtility from 'test/foreground/view/viewTestUtility';

describe('LinkUserIdDialogView', function() {
  beforeEach(function() {
    this.signInManager = new SignInManager();

    this.documentFragment = document.createDocumentFragment();
    this.view = new LinkUserIdDialogView({
      signInManager: this.signInManager
    });
  });

  afterEach(function() {
    this.view.destroy();
  });

  ViewTestUtility.ensureBasicAssumptions.call(this);

  describe('onSubmit', function() {
    it('should tell SignInManager to save the current user\'s GooglePlusId', function() {
      sinon.stub(this.signInManager, 'saveGooglePlusId');

      this.view.onSubmit();
      expect(this.signInManager.saveGooglePlusId.calledOnce).to.equal(true);

      this.signInManager.saveGooglePlusId.restore();
    });
  });
});