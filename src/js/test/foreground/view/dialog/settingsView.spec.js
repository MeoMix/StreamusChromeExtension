define(function(require) {
    'use strict';

    var SettingsView = require('foreground/view/dialog/settingsView');
    var SignInManager = require('background/model/signInManager');
    var Settings = require('background/model/settings');
    var viewTestUtility = require('test/foreground/view/viewTestUtility');

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

        viewTestUtility.ensureBasicAssumptions.call(this);
    });
});