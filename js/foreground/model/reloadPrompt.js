define(function () {
    'use strict';

    var ReloadPrompt = Backbone.Model.extend({

        defaults: function () {
            return {
                promptText: chrome.i18n.getMessage("reloadPromptText"),
                buttonText: chrome.i18n.getMessage("reloadButtonText")
            };
        }
        
    });

    return ReloadPrompt;
});