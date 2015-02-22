define(function (require) {
    'use strict';

    var LinkUserIdDialogView = require('foreground/view/dialog/linkUserIdDialogView');

    describe('LinkUserIdDialogView', function () {
        beforeEach(function () {
            this.documentFragment = document.createDocumentFragment();
            this.view = new LinkUserIdDialogView();
        });

        afterEach(function () {
            this.view.destroy();
        });

        it('should show', function () {
            this.documentFragment.appendChild(this.view.render().el);
            this.view.triggerMethod('show');
        });
        
        describe('onSubmit', function () {
            it('should tell SignInManager to save the current user\'s GooglePlusId', function () {
                sinon.stub(Streamus.backgroundPage.signInManager, 'saveGooglePlusId');

                this.view.onSubmit();
                expect(Streamus.backgroundPage.signInManager.saveGooglePlusId.calledOnce).to.equal(true);
    
                Streamus.backgroundPage.signInManager.saveGooglePlusId.restore();
            });
        });
    });
});