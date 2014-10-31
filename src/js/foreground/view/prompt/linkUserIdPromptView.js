define([
    'foreground/model/prompt',
    'foreground/view/prompt/promptView'
], function (Prompt, PromptView) {
    'use strict';

    var LinkUserIdPromptView = PromptView.extend({
        contentText: chrome.i18n.getMessage('linkAccountMessage'),
        
        signInManager: null,

        initialize: function () {
            this.model = new Prompt({
                title: chrome.i18n.getMessage('linkAccountToGoogle'),
                reminderProperty: 'remindLinkUserId'
            });

            this.signInManager = Streamus.backgroundPage.signInManager;
            
            PromptView.prototype.initialize.apply(this, arguments);
        },

        onSubmit: function () {
            this.signInManager.saveGooglePlusId();
        }
    });

    return LinkUserIdPromptView;
});