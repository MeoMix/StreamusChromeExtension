define([
    'foreground/model/genericPrompt',
    'foreground/view/updateStreamusView',
    'foreground/view/prompt/genericPromptView'
], function (GenericPrompt, UpdateStreamusView, GenericPromptView) {
    'use strict';

    var UpdateStreamusPromptView = GenericPromptView.extend({
        model: null,

        initialize: function () {
            this.model = new GenericPrompt({
                title: chrome.i18n.getMessage('updateRequired'),
                okButtonText: chrome.i18n.getMessage('update'),
                view: new UpdateStreamusView()
            });
            
            GenericPromptView.prototype.initialize.apply(this, arguments);
        }
    });

    return UpdateStreamusPromptView;
});