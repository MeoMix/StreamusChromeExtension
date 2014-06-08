define([
    'foreground/model/genericPrompt',
    'foreground/view/reloadStreamusView',
    'foreground/view/prompt/genericPromptView'
], function (GenericPrompt, ReloadStreamusView, GenericPromptView) {
    'use strict';

    var ReloadStreamusPromptView = GenericPromptView.extend({
        initialize: function () {
            this.model = new GenericPrompt({
                title: chrome.i18n.getMessage('reloadStreamus'),
                okButtonText: chrome.i18n.getMessage('reload'),
                view: new ReloadStreamusView()
            });
            
            GenericPromptView.prototype.initialize.apply(this, arguments);
        }
    });

    return ReloadStreamusPromptView;
});