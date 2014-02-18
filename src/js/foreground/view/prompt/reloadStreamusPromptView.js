define([
    'foreground/model/genericPrompt',
    'foreground/view/prompt/genericPromptView',
    'foreground/view/reloadView'
], function(GenericPrompt, GenericPromptView, ReloadView) {
    'use strict';

    var ReloadStreamusPromptView = GenericPromptView.extend({
        model: null,

        initialize: function () {
            this.model = new GenericPrompt({
                title: chrome.i18n.getMessage('reloadStreamus'),
                okButtonText: chrome.i18n.getMessage('reload'),
                view: new ReloadView()
            });
            
            GenericPromptView.prototype.initialize.call(this, arguments);
        }
    });

    return ReloadStreamusPromptView;
});