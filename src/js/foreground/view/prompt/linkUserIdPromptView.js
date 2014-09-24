define([
    'foreground/model/prompt',
    'foreground/view/prompt/promptView'
], function (Prompt, PromptView) {
    'use strict';

    var LinkUserIdPromptView = PromptView.extend({
        contentText: chrome.i18n.getMessage('linkAccountMessage'),

        initialize: function () {
            this.model = new Prompt({
                title: chrome.i18n.getMessage('linkAccountToGoogle'),
                reminderProperty: 'remindLinkUserId'
            });
            
            PromptView.prototype.initialize.apply(this, arguments);
        },

        onSubmit: function () {
            Streamus.backgroundPage.SignInManager.saveGooglePlusId();
        }
    });

    return LinkUserIdPromptView;
});