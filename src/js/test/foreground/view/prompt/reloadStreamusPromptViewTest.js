define([
    'foreground/view/prompt/reloadStreamusPromptView'
], function (ReloadStreamusPromptView) {
    'use strict';

    describe('ReloadStreamusPromptView', function () {
        beforeEach(function () {
            this.documentFragment = document.createDocumentFragment();
            this.view = new ReloadStreamusPromptView();
        });

        afterEach(function () {
            this.view.destroy();
        });

        it('should show', function () {
            this.documentFragment.appendChild(this.view.render().el);
            this.view.triggerMethod('show');
        });

        describe('onSubmit', function () {
            beforeEach(function () {
                sinon.stub(chrome.runtime, 'reload');
            });

            afterEach(function () {
                chrome.runtime.reload.restore();
            });

            it('should reload the extension', function () {
                this.view.onSubmit();
                expect(chrome.runtime.reload.calledOnce).to.equal(true);
            });
        });
    });
})