define([
    'foreground/model/prompt',
    'foreground/view/prompt/promptView',
    'foreground/view/prompt/settingsView'
], function (Prompt, PromptView, SettingsView) {
    'use strict';
    
    var SettingsPromptView = PromptView.extend({
        model: new Prompt({
            title: chrome.i18n.getMessage('settings'),
            showOkButton: false
        }),

        initialize: function () {
            this.contentView = new SettingsView({
                model: Streamus.backgroundPage.Settings
            });
            
            PromptView.prototype.initialize.apply(this, arguments);
        }
    });

    return SettingsPromptView;
});