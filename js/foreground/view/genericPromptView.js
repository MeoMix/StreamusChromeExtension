define(function () {
    'use strict';

    //  A singleton view which is either displayed somewhere in body with groups of items or empty and hidden.
    var GenericPromptView = Backbone.View.extend({
                
        fadeOutAndHide: function () {
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

        },
        
        //  If the user clicks the 'dark' area outside the panel -- hide the panel.
        hideIfClickOutsidePanel: function (event) {

            if (event.target == event.currentTarget) {
                this.fadeOutAndHide();
            }
        }
    });

    return GenericPromptView;
});