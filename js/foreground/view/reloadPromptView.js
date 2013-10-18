define([
    'text!../template/reloadPrompt.htm'
], function (ReloadPromptTemplate) {
    'use strict';

    var ReloadPromptView = Backbone.View.extend({

        className: 'modalOverlay reloadPrompt prompt',

        template: _.template(ReloadPromptTemplate),

        panel: null,

        events: {
            'click .reload': 'reload',
            'click .wait': 'wait'
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
        },
        
        wait: function () {
            this.$el.removeClass('visible').fadeOut();
        },
        
        fadeInAndShow: function () {
            var self = this;
            
            this.panel.fadeIn(200, function () {
                self.$el.addClass('visible');
            });
        }
        
    });

    return ReloadPromptView;
});