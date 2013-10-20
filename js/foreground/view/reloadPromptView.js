define([
    'text!../template/reloadPrompt.htm',
    'genericPromptView'
], function (ReloadPromptTemplate, GenericPromptView) {
    'use strict';

    var ReloadPromptView = GenericPromptView.extend({

        className: GenericPromptView.prototype.className + ' reloadPrompt',

        template: _.template(ReloadPromptTemplate),

        events: _.extend({}, GenericPromptView.prototype.events, {
            'click .reload': 'reload'
        }),

        reload: function () {
            chrome.runtime.reload();
        }
    });

    return ReloadPromptView;
});