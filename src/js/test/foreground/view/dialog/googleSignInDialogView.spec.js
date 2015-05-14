define(function(require) {
    'use strict';

    var GoogleSignInDialogView = require('foreground/view/dialog/googleSignInDialogView');
    var SignInManager = require('background/model/signInManager');

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

        it('should show', function() {
            this.documentFragment.appendChild(this.view.render().el);
            this.view.triggerMethod('show');
        });

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
});