define([
    'foreground/view/prompt/settingsPromptView'
], function(SettingsPromptView) {
    'use strict';

    describe('SettingsPromptView', function () {
        beforeEach(function () {
            this.documentFragment = document.createDocumentFragment();
            this.view = new SettingsPromptView();
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