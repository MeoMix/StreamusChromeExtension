define([
    'foreground/view/dialog/browserSettingsView'
], function (BrowserSettingsView) {
    'use strict';

    describe('BrowserSettingsView', function () {
        beforeEach(function () {
            this.documentFragment = document.createDocumentFragment();
            this.view = new BrowserSettingsView({
                model: Streamus.backgroundPage.browserSettings
            });
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