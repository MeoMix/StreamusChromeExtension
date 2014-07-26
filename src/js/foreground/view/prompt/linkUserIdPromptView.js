define([
    'foreground/model/genericPrompt',
    'foreground/view/linkUserIdView',
    'foreground/view/prompt/genericPromptView'
], function (GenericPrompt, LinkUserIdView, GenericPromptView) {
    'use strict';

    var Settings = chrome.extension.getBackgroundPage().Settings;

    var LinkUserIdPromptView = GenericPromptView.extend({
        initialize: function () {
            this.model = new GenericPrompt({
                title: chrome.i18n.getMessage('linkAccountToGoogle'),
                view: new LinkUserIdView()
            });
            
            GenericPromptView.prototype.initialize.apply(this, arguments);
        },

        reminderDisabled: function () {
            return !Settings.get('remindLinkUserId');
        }
    });

    return LinkUserIdPromptView;
});