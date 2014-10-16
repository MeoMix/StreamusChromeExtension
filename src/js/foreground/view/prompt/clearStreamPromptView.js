define([
    'foreground/model/prompt',
    'foreground/view/prompt/promptView'
], function (Prompt, PromptView) {
    'use strict';
    
    var ClearStreamPromptView = PromptView.extend({
        contentText: chrome.i18n.getMessage('areYouSureYouWantToClearYourStream'),
        
        streamItems: null,
        
        initialize: function () {
            this.model = new Prompt({
                title: chrome.i18n.getMessage('areYouSure'),
                reminderProperty: 'remindClearStream'
            });

            this.streamItems = Streamus.backgroundPage.StreamItems;

            PromptView.prototype.initialize.apply(this, arguments);
        },
        
        onSubmit: function () {
            this.streamItems.clear();
        }
    });

    return ClearStreamPromptView;
});