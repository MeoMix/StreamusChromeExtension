define([
    'foreground/model/prompt',
    'foreground/view/reloadStreamusView',
    'foreground/view/prompt/promptView'
], function (Prompt, ReloadStreamusView, PromptView) {
    'use strict';

    var ReloadStreamusPromptView = PromptView.extend({
        initialize: function () {
            this.model = new Prompt({
                title: chrome.i18n.getMessage('reloadStreamus'),
                okButtonText: chrome.i18n.getMessage('reload'),
                view: new ReloadStreamusView()
            });
            
            PromptView.prototype.initialize.apply(this, arguments);
        }
    });

    return ReloadStreamusPromptView;
});