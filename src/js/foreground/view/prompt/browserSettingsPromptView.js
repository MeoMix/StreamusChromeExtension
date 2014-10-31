define([
    'foreground/model/prompt',
    'foreground/view/prompt/browserSettingsView',
    'foreground/view/prompt/promptView'
], function (Prompt, BrowserSettingsView, PromptView) {
    'use strict';

    var BrowserSettingsPromptView = PromptView.extend({
        initialize: function () {
            this.model = new Prompt({
                title: chrome.i18n.getMessage('browserSettings'),
                showOkButton: false
            });

            this.contentView = new BrowserSettingsView({
                model: Streamus.backgroundPage.browserSettings
            }); 

            PromptView.prototype.initialize.apply(this, arguments);
        }
    });

    return BrowserSettingsPromptView;
});