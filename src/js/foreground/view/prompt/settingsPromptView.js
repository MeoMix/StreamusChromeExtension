define([
    'foreground/model/prompt',
    'foreground/view/settingsView',
    'foreground/view/prompt/promptView'
], function (Prompt, SettingsView, PromptView) {
    'use strict';
    
    var Settings = Streamus.backgroundPage.Settings;
    
    var SettingsPromptView = PromptView.extend({
        initialize: function () {
            this.model = new Prompt({
                title: chrome.i18n.getMessage('settings'),
                view: new SettingsView({
                    model: Settings
                }),
                showOkButton: false
            });
            
            PromptView.prototype.initialize.apply(this, arguments);
        }
    });

    return SettingsPromptView;
});