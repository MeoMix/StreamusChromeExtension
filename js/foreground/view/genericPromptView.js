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
            this.okButton = this.$el.find('button.ok');

            return this;
        },

        fadeOutAndHide: function () {

            var self = this;

            this.$el.transition({
                'background': this.$el.data('background')
            }, function () {
                self.remove();
            });

            this.panel.transition({
                top: this.panel.data('top')
            });

        },

        fadeInAndShow: function () {

            $('body').append(this.render().el);
            
            //  Store original values in data attribute to be able to revert without magic numbers.
            this.$el.data('background', this.$el.css('background')).transition({
                'background': 'rgba(0, 0, 0, 0.5)'
            });

            this.panel.data('top', this.panel.css('top')).transition({
                top: '50%'
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