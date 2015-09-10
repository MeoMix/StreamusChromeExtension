import GoogleSignInDialogView from 'foreground/view/dialog/googleSignInDialogView';
import SignInManager from 'background/model/signInManager';
import ViewTestUtility from 'test/foreground/view/viewTestUtility';

describe('GoogleSignInDialogView', function() {
  beforeEach(function() {
    this.signInManager = new SignInManager();
    this.documentFragment = document.createDocumentFragment();
    this.view = new GoogleSignInDialogView({
      signInManager: this.signInManager
    });
  });

  afterEach(function() {
    this.view.destroy();
  });

  ViewTestUtility.ensureBasicAssumptions.call(this);

  describe('onSubmit', function() {
    it('should tell SignInManager not to notify again', function() {
      sinon.stub(this.signInManager, 'set');

      this.view.onSubmit();
      expect(this.signInManager.set.calledOnce).to.equal(true);
      expect(this.signInManager.set.calledWith('needGoogleSignIn', false)).to.equal(true);

      this.signInManager.set.restore();
    });
  });
});