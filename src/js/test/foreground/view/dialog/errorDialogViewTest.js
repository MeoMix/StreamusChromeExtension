define(function (require) {
    'use strict';

    var ErrorDialogView = require('foreground/view/dialog/errorDialogView');

    describe('ErrorDialogView', function () {
        beforeEach(function () {
            this.documentFragment = document.createDocumentFragment();
            this.view = new ErrorDialogView();
        });

        afterEach(function () {
            this.view.destroy();
        });

        it('should show', function () {
            this.documentFragment.appendChild(this.view.render().el);
            this.view.triggerMethod('show');
        });
    });
});