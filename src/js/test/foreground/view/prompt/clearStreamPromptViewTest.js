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

        it('should show', function (done) {
            this.documentFragment.appendChild(this.view.render().el);
            //  Wait before removing the element because destroying the view immediately causes race-condition error due to expectance of HTML presence in _transitionIn
            this.view.onVisible = done;
            this.view.triggerMethod('show');
        });
        
        describe('onSubmit', function () {
            it('should clear StreamItems', function () {
                sinon.stub(Streamus.backgroundPage.stream, 'clear');

                this.view.onSubmit();
                expect(Streamus.backgroundPage.stream.clear.calledOnce).to.equal(true);

                Streamus.backgroundPage.stream.clear.restore();
            });
        });
    });
});