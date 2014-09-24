define([
    'foreground/model/prompt',
    'foreground/view/linkUserIdView',
    'foreground/view/prompt/promptView'
], function (Prompt, LinkUserIdView, PromptView) {
    'use strict';

    var LinkUserIdPromptView = PromptView.extend({
        initialize: function () {
            this.model = new Prompt({
                title: chrome.i18n.getMessage('linkAccountToGoogle'),
                reminderProperty: 'remindLinkUserId',
                view: new LinkUserIdView()
            });
            
            PromptView.prototype.initialize.apply(this, arguments);
        }
    });

    return LinkUserIdPromptView;
});