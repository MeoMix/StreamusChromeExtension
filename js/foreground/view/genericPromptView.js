define(function () {
    'use strict';

    //  A singleton view which is either displayed somewhere in body with groups of items or empty and hidden.
    var GenericPromptView = Backbone.View.extend({
        
        className: 'modalOverlay prompt',

        events: {
            'click': 'hideIfClickOutsidePanel',
            'click .remove': 'fadeOutAndHide',
            'click .cancel': 'fadeOutAndHide',
            'click .ok': 'doOk',
            'keydown .submittable': 'doOkOnEnter'
        },
        
        panel: null,
        
        render: function (templateOptions) {

            var genericTemplateOptions = _.extend({}, templateOptions, {
                //  Mix in chrome to reference internationalize.
                'chrome.i18n': chrome.i18n
            });
            
            if (this.model) {
                genericTemplateOptions = _.extend(genericTemplateOptions, this.model.toJSON());
            }

            this.$el.html(this.template(genericTemplateOptions));

            this.panel = this.$el.children('.panel');

            return this;
        },

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
        },
        
        //  If the enter key is pressed on a submittable element, treat as if user pressed OK button.
        doOkOnEnter: function(event) {
            
            if (event.which === 13) {
                this.doOk();
            }

        },
        
        //  Just a stub -- generally expect people to provide their own logic for doOk
        doOk: function() {
            this.fadeOutAndHide();
        }
    });

    return GenericPromptView;
});