define([
    'foreground/model/prompt',
    'foreground/view/prompt/promptView',
    'foreground/view/prompt/settingsView'
], function (Prompt, PromptView, SettingsView) {
    'use strict';
    
    var SettingsPromptView = PromptView.extend({
        id: 'settingsPrompt',

        initialize: function () {
            this.model = new Prompt({
                title: chrome.i18n.getMessage('settings'),
                submitButtonText: chrome.i18n.getMessage('save')
            });

            this.contentView = new SettingsView({
                model: Streamus.backgroundPage.settings
            });
            
            PromptView.prototype.initialize.apply(this, arguments);
        },
        
        onSubmit: function() {
            this.contentView.save();
        }
    });

    return SettingsPromptView;
});