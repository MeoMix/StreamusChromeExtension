define([
    'foreground/model/prompt',
    'foreground/view/clearStreamView',
    'foreground/view/prompt/promptView'
], function (Prompt, ClearStreamView, PromptView) {
    'use strict';
    
    var Settings = Streamus.backgroundPage.Settings;

    var ClearStreamPromptView = PromptView.extend({
        initialize: function () {
            this.model = new Prompt({
                title: chrome.i18n.getMessage('areYouSure'),
                showReminder: true,
                view: new ClearStreamView()
            });
            
            PromptView.prototype.initialize.apply(this, arguments);
        },

        reminderDisabled: function () {
            return !Settings.get('remindClearStream');
        }
    });

    return ClearStreamPromptView;
});