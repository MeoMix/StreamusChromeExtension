define([
    'foreground/view/prompt/clearStreamPromptView'
], function (ClearStreamPromptView) {
    'use strict';

    describe('ClearStreamPromptView', function () {
        beforeEach(function () {
            this.documentFragment = document.createDocumentFragment();
            this.view = new ClearStreamPromptView();
        });

        afterEach(function () {
            this.view.destroy();
        });

        it('should show', function () {
            this.documentFragment.appendChild(this.view.render().el);
            this.view.triggerMethod('show');
        });
        
        describe('onSubmit', function () {
            it('should clear StreamItems', function () {
                sinon.stub(Streamus.backgroundPage.StreamItems, 'clear');

                this.view.onSubmit();
                expect(Streamus.backgroundPage.StreamItems.clear.calledOnce).to.equal(true);

                Streamus.backgroundPage.StreamItems.clear.restore();
            });
        });
    });
});