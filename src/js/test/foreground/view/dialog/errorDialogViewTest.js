﻿define([
    'foreground/view/dialog/errorDialogView'
], function (ErrorDialogView) {
    'use strict';

    describe('ErrorDialogView', function () {
        beforeEach(function () {
            this.documentFragment = document.createDocumentFragment();
            this.view = new ErrorDialogView();
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
    });
});