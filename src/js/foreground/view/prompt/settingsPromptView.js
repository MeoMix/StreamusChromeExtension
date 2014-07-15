define([
    'foreground/model/genericPrompt',
    'foreground/view/settingsView',
    'foreground/view/prompt/genericPromptView'
], function (GenericPrompt, SettingsView, GenericPromptView) {
    'use strict';
    
    var Settings = chrome.extension.getBackgroundPage().Settings;
    
    var SettingsPromptView = GenericPromptView.extend({
        initialize: function () {
            this.model = new GenericPrompt({
                title: chrome.i18n.getMessage('settings'),
                view: new SettingsView({
                    model: Settings
                }),
                showOkButton: false
            });
            
            GenericPromptView.prototype.initialize.apply(this, arguments);
        }
    });

    return SettingsPromptView;
});