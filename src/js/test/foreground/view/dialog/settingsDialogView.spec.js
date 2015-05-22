define(function(require) {
    'use strict';

    var SettingsDialogView = require('foreground/view/dialog/settingsDialogView');
    var viewTestUtility = require('test/foreground/view/viewTestUtility');

    describe('SettingsDialogView', function() {
        beforeEach(function() {
            this.documentFragment = document.createDocumentFragment();
            this.view = new SettingsDialogView();
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