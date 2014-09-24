define([
    'foreground/model/prompt',
    'foreground/view/prompt/promptView'
], function (Prompt, PromptView) {
    'use strict';
    
    var ClearStreamPromptView = PromptView.extend({
        contentText: chrome.i18n.getMessage('areYouSureYouWantToClearYourStream'),
        
        model: new Prompt({
            title: chrome.i18n.getMessage('areYouSure'),
            reminderProperty: 'remindClearStream'
        }),
        
        onSubmit: function () {
            Streamus.backgroundPage.StreamItems.clear();
        }
    });

    return ClearStreamPromptView;
});