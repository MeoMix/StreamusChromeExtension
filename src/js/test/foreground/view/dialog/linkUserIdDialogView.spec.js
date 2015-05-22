define(function(require) {
    'use strict';

    var LinkUserIdDialogView = require('foreground/view/dialog/linkUserIdDialogView');
    var SignInManager = require('background/model/signInManager');
    var viewTestUtility = require('test/foreground/view/viewTestUtility');

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

        viewTestUtility.ensureBasicAssumptions.call(this);

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