define([
    'foreground/model/prompt',
    'foreground/view/prompt/promptContentView',
    'foreground/view/prompt/promptView'
], function (Prompt, PromptContentView, PromptView) {
    'use strict';

    var UpdateStreamusPromptView = PromptView.extend({
        id: 'updateStreamusPrompt',

        initialize: function () {
            this.model = new Prompt({
                title: chrome.i18n.getMessage('updateRequired'),
                submitButtonText: chrome.i18n.getMessage('update')
            });

            this.contentView = new PromptContentView({
                template: _.template(chrome.i18n.getMessage('anUpdateToStreamusIsAvailable') + '. ' + chrome.i18n.getMessage('pleaseClickUpdateToReloadAndApplyTheUpdate'))
            });

            PromptView.prototype.initialize.apply(this, arguments);
        },

        onSubmit: function () {
            chrome.runtime.reload();
        }
    });

    return UpdateStreamusPromptView;
});