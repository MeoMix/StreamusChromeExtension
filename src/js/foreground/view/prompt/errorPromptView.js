define([
    'foreground/model/genericPrompt',
    'foreground/view/errorView',
    'foreground/view/prompt/genericPromptView'
], function (GenericPrompt, ErrorView, GenericPromptView) {
    'use strict';
    
    var ErrorPromptView = GenericPromptView.extend({
        initialize: function (options) {
            this.model = new GenericPrompt({
                title: chrome.i18n.getMessage('errorEncountered'),
                view: new ErrorView({
                    text: options.text
                })
            });

            GenericPromptView.prototype.initialize.apply(this, arguments);
        }
    });

    return ErrorPromptView;
});