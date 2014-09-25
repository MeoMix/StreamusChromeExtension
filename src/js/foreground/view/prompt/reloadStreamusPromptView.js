define([
    'foreground/model/prompt',
    'foreground/view/prompt/promptView'
], function (Prompt, PromptView) {
    'use strict';

    var ReloadStreamusPromptView = PromptView.extend({
        contentText: chrome.i18n.getMessage('streamusIsTakingALongTimeToLoadReloadingMayHelp'),
        
        initialize: function () {
            this.model = new Prompt({
                title: chrome.i18n.getMessage('reloadStreamus'),
                okButtonText: chrome.i18n.getMessage('reload')
            });

            PromptView.prototype.initialize.apply(this, arguments);
        },

        onSubmit: function () {
            chrome.runtime.reload();
        }
    });

    return ReloadStreamusPromptView;
});