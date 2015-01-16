define([
    'foreground/view/dialog/settingsDialogView'
], function(SettingsDialogView) {
    'use strict';

    describe('SettingsDialogView', function () {
        beforeEach(function () {
            this.documentFragment = document.createDocumentFragment();
            this.view = new SettingsDialogView();
        });

        afterEach(function () {
            this.view.destroy();
        });

        it('should show', function (done) {
            this.documentFragment.appendChild(this.view.render().el);
            //  Wait before removing the element because destroying the view immediately causes race-condition error due to expectance of HTML presence in _transitionIn
            this.view.onVisible = done;
            this.view.triggerMethod('show');
        });
        
        describe('onSubmit', function () {
            it('should save configured settings', function () {
                sinon.stub(this.view.contentView, 'save');

                this.view.onSubmit();
                expect(this.view.contentView.save.calledOnce).to.equal(true);

                this.view.contentView.save.restore();
            });
        });
    });
});