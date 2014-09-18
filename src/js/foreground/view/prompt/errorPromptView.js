define([
    'foreground/model/prompt',
    'foreground/view/errorView',
    'foreground/view/prompt/promptView'
], function (Prompt, ErrorView, PromptView) {
    'use strict';
    
    var ErrorPromptView = PromptView.extend({
        initialize: function (options) {
            this.model = new Prompt({
                title: chrome.i18n.getMessage('errorEncountered'),
                view: new ErrorView({
                    text: options.text
                })
            });

            PromptView.prototype.initialize.apply(this, arguments);
        }
    });

    return ErrorPromptView;
});