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

            this.fadeOutAndHide();
        },
        
        fadeOutAndHide: function() {
            var self = this;

            this.$el.removeClass('visible').transition({
                opacity: 0
            }, 400, function () {
                self.remove();
            });
        },

        fadeInAndShow: function () {
            var self = this;
            
            $('body').append(this.render().el);

            this.panel.show().transition({
                opacity: 1
            }, 200, function () {
                self.$el.addClass('visible');
            });

        }
        
    });

    return ReloadPromptView;
});