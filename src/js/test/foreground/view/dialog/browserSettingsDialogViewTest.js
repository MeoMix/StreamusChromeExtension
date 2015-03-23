define(function(require) {
    'use strict';

    var BrowserSettingsDialogView = require('foreground/view/dialog/browserSettingsDialogView');

    describe('BrowserSettingsDialogView', function() {
        beforeEach(function() {
            this.documentFragment = document.createDocumentFragment();
            this.view = new BrowserSettingsDialogView();
        });

        afterEach(function() {
            this.view.destroy();
        });

        it('should show', function() {
            this.documentFragment.appendChild(this.view.render().el);
            this.view.triggerMethod('show');
        });

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