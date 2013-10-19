define([
    'text!../template/reloadPrompt.htm',
    'genericPromptView'
], function (ReloadPromptTemplate, GenericPromptView) {
    'use strict';

    var ReloadPromptView = GenericPromptView.extend({

        className: 'modalOverlay reloadPrompt prompt',

        template: _.template(ReloadPromptTemplate),

        panel: null,

        events: {
            'click .reload': 'reload',
            'click .wait': 'fadeOutAndHide',
            'click .remove': 'fadeOutAndHide'
        },

        render: function () {
            this.$el.html(this.template(
                _.extend({
                    //  Mix in chrome to reference internationalize.
                    'chrome.i18n': chrome.i18n
                })
            ));

            this.panel = this.$el.children('.panel');

            return this;
        },

        reload: function () {
            chrome.runtime.reload();
        }
    });

    return ReloadPromptView;
});