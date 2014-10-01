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
            
            //  TODO: Just monitoring this for a while to see if it happens to people very frequently.
            Streamus.backgroundPage.ClientErrorManager.logErrorMessage("ReloadStreamusPromptView shown");
        },

        onSubmit: function () {
            chrome.runtime.reload();
        }
    });

    return ReloadStreamusPromptView;
});