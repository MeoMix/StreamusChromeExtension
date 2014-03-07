define([
    'foreground/model/genericPrompt',
    'foreground/view/prompt/genericPromptView',
    'foreground/view/updateStreamusView'
], function (GenericPrompt, GenericPromptView, UpdateStreamusView) {
    'use strict';

    var UpdateStreamusPromptView = GenericPromptView.extend({
        model: null,

        initialize: function () {
            this.model = new GenericPrompt({
                title: chrome.i18n.getMessage('updateRequired'),
                okButtonText: chrome.i18n.getMessage('update'),
                view: new UpdateStreamusView()
            });
            
            GenericPromptView.prototype.initialize.call(this, arguments);
        }
    });

    return UpdateStreamusPromptView;
});