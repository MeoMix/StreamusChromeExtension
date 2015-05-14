define(function(require) {
    'use strict';

    var LinkUserIdDialogView = require('foreground/view/dialog/linkUserIdDialogView');
    var SignInManager = require('background/model/signInManager');

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

        it('should show', function() {
            this.documentFragment.appendChild(this.view.render().el);
            this.view.triggerMethod('show');
        });

        describe('onSubmit', function() {
            it('should tell SignInManager to save the current user\'s GooglePlusId', function() {
                sinon.stub(this.signInManager, 'saveGooglePlusId');

                this.view.onSubmit();
                expect(this.signInManager.saveGooglePlusId.calledOnce).to.equal(true);

                this.signInManager.saveGooglePlusId.restore();
            });
        });
    });
});