define([
    'foreground/view/prompt/linkUserIdPromptView'
], function (LinkUserIdPromptView) {
    'use strict';

    describe('LinkUserIdPromptView', function () {
        beforeEach(function () {
            this.documentFragment = document.createDocumentFragment();
            this.view = new LinkUserIdPromptView();
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
                sinon.stub(Streamus.backgroundPage.SignInManager, 'saveGooglePlusId');

                this.view.onSubmit();
                expect(Streamus.backgroundPage.SignInManager.saveGooglePlusId.calledOnce).to.equal(true);
    
                Streamus.backgroundPage.SignInManager.saveGooglePlusId.restore();
            });
        });
    });
});