define([
    'foreground/model/genericPrompt',
    'foreground/view/prompt/genericPromptView',
    'foreground/view/reloadStreamusView'
], function(GenericPrompt, GenericPromptView, ReloadStreamusView) {
    'use strict';

    var ReloadStreamusPromptView = GenericPromptView.extend({
        model: null,

        initialize: function () {
            this.model = new GenericPrompt({
                title: chrome.i18n.getMessage('reloadStreamus'),
                okButtonText: chrome.i18n.getMessage('reload'),
                view: new ReloadStreamusView()
            });
            
            GenericPromptView.prototype.initialize.call(this, arguments);
        }
    });

    return ReloadStreamusPromptView;
});