define([
    'foreground/model/prompt',
    'foreground/view/browserSettingsView',
    'foreground/view/prompt/promptView'
], function (Prompt, BrowserSettingsView, PromptView) {
    'use strict';

    var BrowserSettingsPromptView = PromptView.extend({
        model: new Prompt({
            title: chrome.i18n.getMessage('browserSettings'),
            showOkButton: false
        }),

        initialize: function () {
            this.contentView = new BrowserSettingsView({
                model: Streamus.backgroundPage.BrowserSettings
            }); 

            PromptView.prototype.initialize.apply(this, arguments);
        }
    });

    return BrowserSettingsPromptView;
});