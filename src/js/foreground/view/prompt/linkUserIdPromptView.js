define([
    'foreground/model/prompt',
    'foreground/view/prompt/promptView'
], function (Prompt, PromptView) {
    'use strict';

    var LinkUserIdPromptView = PromptView.extend({
        id: 'linkUserIdPrompt',
        signInManager: null,

        initialize: function () {
            this.model = new Prompt({
                title: chrome.i18n.getMessage('linkAccountToGoogle'),
                reminderProperty: 'remindLinkUserId'
            });
            
            this.contentView = new Marionette.ItemView({
                template: _.template(chrome.i18n.getMessage('linkAccountMessage'))
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