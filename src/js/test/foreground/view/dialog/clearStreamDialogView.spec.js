define(function(require) {
    'use strict';

    var ClearStreamDialogView = require('foreground/view/dialog/clearStreamDialogView');
    var StreamItems = require('background/collection/streamItems');

    describe('ClearStreamDialogView', function() {
        beforeEach(function() {
            this.streamItems = new StreamItems();

            this.documentFragment = document.createDocumentFragment();
            this.view = new ClearStreamDialogView({
                streamItems: this.streamItems
            });
        });

        afterEach(function() {
            this.view.destroy();
        });

        it('should show', function() {
            this.documentFragment.appendChild(this.view.render().el);
            this.view.triggerMethod('show');
        });

        describe('onSubmit', function() {
            it('should clear StreamItems', function() {
                sinon.stub(this.streamItems, 'clear');

                this.view.onSubmit();
                expect(this.streamItems.clear.calledOnce).to.equal(true);

                this.streamItems.clear.restore();
            });
        });
    });
});