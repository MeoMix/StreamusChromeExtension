define([
    'foreground/view/dialog/settingsView'
], function (SettingsView) {
    'use strict';

    describe('SettingsView', function () {
        beforeEach(function () {
            this.documentFragment = document.createDocumentFragment();
            this.view = new SettingsView({
                model: Streamus.backgroundPage.settings
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