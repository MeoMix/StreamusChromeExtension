define([
    'foreground/model/prompt',
    'foreground/view/updateStreamusView',
    'foreground/view/prompt/promptView'
], function (Prompt, UpdateStreamusView, PromptView) {
    'use strict';

    var UpdateStreamusPromptView = PromptView.extend({
        initialize: function () {
            this.model = new Prompt({
                title: chrome.i18n.getMessage('updateRequired'),
                okButtonText: chrome.i18n.getMessage('update'),
                view: new UpdateStreamusView()
            });
            
            PromptView.prototype.initialize.apply(this, arguments);
        }
    });

    return UpdateStreamusPromptView;
});