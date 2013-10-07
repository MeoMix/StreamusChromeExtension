define([
    'reloadPrompt',
    'text!../template/reloadPrompt.htm'
], function (ReloadPrompt, ReloadPromptTemplate) {
    'use strict';

    var RestartPromptView = Backbone.View.extend({

        className: 'modalOverlay reloadPrompt',

        template: _.template(ReloadPromptTemplate),

        model: new ReloadPrompt,

        events: {
            'click .reload': 'reload',
            'click .wait': 'wait'
        },

        render: function () {
            this.$el.html(this.template(this.model.toJSON()));
            return this;
        },

        reload: function () {
            chrome.runtime.reload();
        },
        
        wait: function () {
            this.$el.removeClass('visible').fadeOut();
        }
        
    });

    return RestartPromptView;
});