define([
    'foreground/model/prompt',
    'foreground/view/prompt/promptView'
], function (Prompt, PromptView) {
    'use strict';

    var UpdateStreamusPromptView = PromptView.extend({
        contentText: chrome.i18n.getMessage('anUpdateToStreamusIsAvailable') + '. ' + chrome.i18n.getMessage('pleaseClickUpdateToReloadAndApplyTheUpdate'),

        initialize: function () {
            this.model = new Prompt({
                title: chrome.i18n.getMessage('updateRequired'),
                okButtonText: chrome.i18n.getMessage('update')
            });

            PromptView.prototype.initialize.apply(this, arguments);
        },

        onSubmit: function () {
            chrome.runtime.reload();
        }
    });

    return UpdateStreamusPromptView;
});