define(function (require) {
    'use strict';

    var ClearStreamDialogView = require('foreground/view/dialog/clearStreamDialogView');

    describe('ClearStreamDialogView', function () {
        beforeEach(function () {
            this.documentFragment = document.createDocumentFragment();
            this.view = new ClearStreamDialogView();
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
                sinon.stub(Streamus.backgroundPage.stream.get('items'), 'clear');

                this.view.onSubmit();
                expect(Streamus.backgroundPage.stream.get('items').clear.calledOnce).to.equal(true);

                Streamus.backgroundPage.stream.get('items').clear.restore();
            });
        });
    });
});