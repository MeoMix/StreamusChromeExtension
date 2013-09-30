define(function () {
    'use strict';

    var ReloadPrompt = Backbone.Model.extend({

        defaults: function () {
            return {
                promptText: chrome.i18n.getMessage('reloadPromptText'),
                reloadButtonText: chrome.i18n.getMessage('reloadButtonText'),
                waitButtonText: chrome.i18n.getMessage('waitButtonText')
            };
        }
        
    });

    return ReloadPrompt;
});