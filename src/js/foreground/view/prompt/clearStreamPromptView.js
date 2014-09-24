define([
    'foreground/model/prompt',
    'foreground/view/clearStreamView',
    'foreground/view/prompt/promptView'
], function (Prompt, ClearStreamView, PromptView) {
    'use strict';

    var ClearStreamPromptView = PromptView.extend({
        initialize: function () {
            this.model = new Prompt({
                title: chrome.i18n.getMessage('areYouSure'),
                reminderProperty: 'remindClearStream',
                view: new ClearStreamView()
            });
            
            PromptView.prototype.initialize.apply(this, arguments);
        }
    });

    return ClearStreamPromptView;
});