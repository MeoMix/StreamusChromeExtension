define([
    'foreground/model/prompt',
    'foreground/view/prompt/promptView'
], function (Prompt, PromptView) {
    'use strict';
    
    var ErrorPromptView = PromptView.extend({
        model: new Prompt({
            title: chrome.i18n.getMessage('errorEncountered')
        }),

        initialize: function (options) {
            this.contentText = options.text;

            PromptView.prototype.initialize.apply(this, arguments);
        }
    });

    return ErrorPromptView;
});