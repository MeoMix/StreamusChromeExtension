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

        it('should show', function () {
            this.documentFragment.appendChild(this.view.render().el);
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