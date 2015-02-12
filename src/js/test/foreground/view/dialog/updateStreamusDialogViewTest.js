define(function (require) {
    'use strict';

    var UpdateStreamusDialogView = require('foreground/view/dialog/updateStreamusDialogView');

    describe('UpdateStreamusDialogView', function () {
        beforeEach(function () {
            this.documentFragment = document.createDocumentFragment();
            this.view = new UpdateStreamusDialogView();
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
            it('should reload the extension', function () {
                sinon.stub(chrome.runtime, 'reload');

                this.view.onSubmit();
                expect(chrome.runtime.reload.calledOnce).to.equal(true);

                chrome.runtime.reload.restore();
            });
        });
    });
});