define([
    'foreground/view/genericForegroundView',
    'text!template/genericPrompt.html'
], function (GenericForegroundView, GenericPromptTemplate) {
    'use strict';

    var GenericPromptView = GenericForegroundView.extend({
        
        className: 'modalOverlay prompt',
        
        template: _.template(GenericPromptTemplate),

        events: {
            'click': 'hideIfClickOutsidePanel',
            'click .remove': 'fadeOutAndHide',
            'click .ok': 'doOk',
            'keydown .submittable': 'doOkOnEnter'
        },
        
        panel: null,
 
        okButtonText: chrome.i18n.getMessage('ok'),

        okButton: null,
        showCancelButton: true,
        
        render: function () {
            
            this.$el.html(this.template({
                //  Mix in chrome to reference internationalize.
                'chrome.i18n': chrome.i18n,
                'promptTitle': this.title,
                'okButtonText': this.okButtonText
            }));

            //  Add specific content to the generic dialog's interior
            this.$el.find('.content').append(this.model.render().el);

            this.panel = this.$el.children('.panel');
            this.okButton = this.$el.find('button.ok');

            return this;
        },
        
        initialize: function (options) {
            this.title = options.title || this.title;
            this.okButtonText = options.okButtonText || this.okButtonText;
            this.showCancelButton = options.showCancelButton || this.showCancelButton;
            this.$el.addClass(this.model.className + 'Prompt');
        },

        fadeInAndShow: function () {

            $('body').append(this.render().el);

            //  Store original values in data attribute to be able to revert without magic numbers.
            this.$el.data('background', this.$el.css('background')).transition({
                'background': 'rgba(0, 0, 0, 0.5)'
            }, 'snap');

            //  Calculate center for prompt by finding the average difference between prompts height and its parent
            var yTranslateCenter = (this.$el.parent().height() - this.panel.height()) / 2;
            
            this.panel.transition({
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

            this.panel.transition({
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
            var isValid = _.isFunction(this.model.validate) ? this.model.validate() : true;
            
            if (isValid) {
                
                if (_.isFunction(this.model.doOk)) {
                    this.model.doOk();
                }

                this.fadeOutAndHide();
            }
            
        }
    });

    return GenericPromptView;
});