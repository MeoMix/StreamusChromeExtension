define([
    'foreground/model/genericPrompt',
    'foreground/view/settingsView',
    'foreground/view/prompt/genericPromptView'
], function (GenericPrompt, SettingsView, GenericPromptView) {
    'use strict';
    
    var SettingsPromptView = GenericPromptView.extend({
        model: null,
        
        initialize: function () {

            this.model = new GenericPrompt({
                title: chrome.i18n.getMessage('settings'),
                view: new SettingsView(),
                showOkButton: false
            });
            
            GenericPromptView.prototype.initialize.apply(this, arguments);
        }
    });

    return SettingsPromptView;
});