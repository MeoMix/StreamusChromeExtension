define([
    'foreground/model/prompt',
    'foreground/view/browserSettingsView',
    'foreground/view/prompt/promptView'
], function (Prompt, BrowserSettingsView, PromptView) {
    'use strict';

    var BrowserSettings = Streamus.backgroundPage.BrowserSettings;

    var BrowserSettingsPromptView = PromptView.extend({
        initialize: function () {
            this.model = new Prompt({
                title: chrome.i18n.getMessage('browserSettings'),
                view: new BrowserSettingsView({
                    model: BrowserSettings
                }),
                showOkButton: false
            });

            PromptView.prototype.initialize.apply(this, arguments);
        }
    });

    return BrowserSettingsPromptView;
});