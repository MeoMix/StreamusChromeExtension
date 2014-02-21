define([
    'text!template/genericPrompt.html'
], function (GenericPromptTemplate) {
    'use strict';

    var GenericPromptView = Backbone.Marionette.ItemView.extend({
        
        className: 'modalOverlay prompt',
        
        template: _.template(GenericPromptTemplate),

        events: {
            'click': 'hideIfClickOutsidePanel',
            'click .remove': 'fadeOutAndHide',
            'click @ui.okButton': 'doOk',
            'keydown .submittable': 'doOkOnEnter'
        },
        
        ui: {
            panel: '.panel',
            content: '.content',
            okButton: 'button.ok'
        },
        
        onRender: function () {
            //  Add specific content to the generic dialog's interior
            this.ui.content.append(this.model.get('view').render().el);
        },
        
        initialize: function () {
            this.$el.addClass(this.model.get('view').className + 'Prompt');
        },

        fadeInAndShow: function () {

            $('body').append(this.render().el);

            //  Store original values in data attribute to be able to revert without magic numbers.
            this.$el.data('background', this.$el.css('background')).transition({
                'background': 'rgba(0, 0, 0, 0.5)'
            }, 'snap');

            //  Calculate center for prompt by finding the average difference between prompts height and its parent
            var yTranslateCenter = (this.$el.parent().height() - this.ui.panel.height()) / 2;
            
            this.ui.panel.transition({
                y: yTranslateCenter,
                opacity: 1
            }, 'snap');
            
        },
        
        fadeOutAndHide: function () {

            this.$el.transition({
                'background': this.$el.data('background')
            }, function () {
                this.remove();
            }.bind(this));

            this.ui.panel.transition({
                y: 0,
                opacity: 0
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
        
        doOk: function () {
            //  Run validation logic if provided else assume valid
            var contentView = this.model.get('view');

            var isValid = _.isFunction(contentView.validate) ? contentView.validate() : true;
            
            if (isValid) {
                
                if (_.isFunction(contentView.doOk)) {
                    contentView.doOk();
                }

                this.fadeOutAndHide();
            }
            
        }
    });

    return GenericPromptView;
});