define([
    'foreground/view/prompt/browserSettingsPromptView'
], function (BrowserSettingsPromptView) {
    'use strict';

    describe('BrowserSettingsPromptView', function () {
        beforeEach(function () {
            this.documentFragment = document.createDocumentFragment();
            this.view = new BrowserSettingsPromptView();
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