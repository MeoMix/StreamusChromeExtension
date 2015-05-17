define(function(require) {
    'use strict';

    var BrowserSettingsView = require('foreground/view/dialog/browserSettingsView');
    var Settings = require('background/model/settings');

    describe('BrowserSettingsView', function() {
        beforeEach(function() {
            this.documentFragment = document.createDocumentFragment();
            this.view = new BrowserSettingsView({
                model: new Settings()
            });
        });

        afterEach(function() {
            this.view.destroy();
        });

        it('should show', function() {
            this.documentFragment.appendChild(this.view.render().el);
            this.view.triggerMethod('show');
        });
    });
});