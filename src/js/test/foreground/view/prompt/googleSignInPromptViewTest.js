define([
    'foreground/view/prompt/googleSignInPromptView'
], function (GoogleSignInPromptView) {
    'use strict';

    describe('GoogleSignInPromptView', function () {
        beforeEach(function () {
            this.documentFragment = document.createDocumentFragment();
            this.view = new GoogleSignInPromptView();
        });

        afterEach(function () {
            this.view.destroy();
        });

        it('should show', function () {
            this.documentFragment.appendChild(this.view.render().el);
            this.view.triggerMethod('show');
        });
        
        describe('onSubmit', function () {
            it('should tell SignInManager not to prompt again', function () {
                sinon.stub(Streamus.backgroundPage.signInManager, 'set');

                this.view.onSubmit();
                expect(Streamus.backgroundPage.signInManager.set.calledOnce).to.equal(true);
                expect(Streamus.backgroundPage.signInManager.set.calledWith('needPromptGoogleSignIn', false)).to.equal(true);

                Streamus.backgroundPage.signInManager.set.restore();
            });
        });
    });
});