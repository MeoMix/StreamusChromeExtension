define([
    'foreground/model/prompt',
    'foreground/view/linkUserIdView',
    'foreground/view/prompt/promptView'
], function (Prompt, LinkUserIdView, PromptView) {
    'use strict';

    var Settings = Streamus.backgroundPage.Settings;

    var LinkUserIdPromptView = PromptView.extend({
        initialize: function () {
            this.model = new Prompt({
                title: chrome.i18n.getMessage('linkAccountToGoogle'),
                showReminder: true,
                view: new LinkUserIdView()
            });
            
            PromptView.prototype.initialize.apply(this, arguments);
        },

        reminderDisabled: function () {
            return !Settings.get('remindLinkUserId');
        }
    });

    return LinkUserIdPromptView;
});