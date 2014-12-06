define([
    'foreground/model/prompt',
    'foreground/view/prompt/promptView'
], function (Prompt, PromptView) {
    'use strict';
    
    var ClearStreamPromptView = PromptView.extend({
        id: 'clearStreamPrompt',
        stream: null,
        
        initialize: function () {
            this.model = new Prompt({
                reminderProperty: 'remindClearStream'
            });

            this.contentView = new Marionette.ItemView({
                template: _.template(chrome.i18n.getMessage('clearStreamQuestion'))
            });

            this.stream = Streamus.backgroundPage.stream;

            PromptView.prototype.initialize.apply(this, arguments);
        },
        
        onSubmit: function () {
            this.stream.clear();
        }
    });

    return ClearStreamPromptView;
});