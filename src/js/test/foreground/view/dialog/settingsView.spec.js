define(function(require) {
    'use strict';

    var SettingsView = require('foreground/view/dialog/settingsView');
    var SignInManager = require('background/model/signInManager');
    var Settings = require('background/model/settings');

    describe('SettingsView', function() {
        beforeEach(function() {
            this.documentFragment = document.createDocumentFragment();
            this.view = new SettingsView({
                model: new Settings(),
                signInManager: new SignInManager()
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