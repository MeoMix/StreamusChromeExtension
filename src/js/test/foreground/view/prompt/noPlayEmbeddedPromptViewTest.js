define([
    'foreground/view/prompt/noPlayEmbeddedPromptView'
], function (NoPlayEmbeddedPromptView) {
    'use strict';

    describe('NoPlayEmbeddedPromptView', function () {
        beforeEach(function () {
            this.documentFragment = document.createDocumentFragment();
            this.view = new NoPlayEmbeddedPromptView();
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