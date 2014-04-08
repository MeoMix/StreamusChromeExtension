define([
    'common/view/settingsView',
    'foreground/model/genericPrompt',
    'foreground/view/prompt/genericPromptView'
], function (SettingsView, GenericPrompt, GenericPromptView) {
    'use strict';
    
    var SettingsPromptView = GenericPromptView.extend({
        model: null,
        
        initialize: function () {

            this.model = new GenericPrompt({
                title: chrome.i18n.getMessage('settings'),
                okButtonText: chrome.i18n.getMessage('save'),
                view: new SettingsView()
            });
            
            GenericPromptView.prototype.initialize.call(this, arguments);
        }
    });

    return SettingsPromptView;
});