define(function(require) {
    'use strict';

    var BrowserSettingsDialogView = require('foreground/view/dialog/browserSettingsDialogView');
    var viewTestUtility = require('test/foreground/view/viewTestUtility');

    describe('BrowserSettingsDialogView', function() {
        beforeEach(function() {
            this.documentFragment = document.createDocumentFragment();
            this.view = new BrowserSettingsDialogView();
        });

        afterEach(function() {
            this.view.destroy();
        });

        viewTestUtility.ensureBasicAssumptions.call(this);

        describe('onSubmit', function() {
            it('should save configured settings', function() {
                sinon.stub(this.view.contentView, 'save');

                this.view.onSubmit();
                expect(this.view.contentView.save.calledOnce).to.equal(true);

                this.view.contentView.save.restore();
            });
        });
    });
});