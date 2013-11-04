define([
    'text!../template/genericPrompt.htm'
], function (GenericPromptTemplate) {
    'use strict';

    var GenericPromptView = Backbone.View.extend({
        
        className: 'modalOverlay prompt',
        
        template: _.template(GenericPromptTemplate),

        events: {
            'click': 'hideIfClickOutsidePanel',
            'click .remove': 'fadeOutAndHide',
            'click .cancel': 'fadeOutAndHide',
            'click .ok': 'doOk',
            'keydown .submittable': 'doOkOnEnter'
        },
        
        panel: null,
 
        okButtonText: chrome.i18n.getMessage('okButtonText'),
        cancelButtonText: chrome.i18n.getMessage('cancelButtonText'),
            
        okButton: null,
        
        render: function () {
            
            this.$el.html(this.template({
                //  Mix in chrome to reference internationalize.
                'chrome.i18n': chrome.i18n,
                'promptTitle': this.title,
                'okButtonText': this.okButtonText,
                'cancelButtonText': this.cancelButtonText
            }));

            //  Add specific content to the generic dialog's interior
            this.$el.find('.content').append(this.model.render().el);

            this.panel = this.$el.children('.panel');
            this.okButton = this.$el.find('button.ok');

            return this;
        },
        
        initialize: function (options) {

            console.log("Options:", options);

            this.title = options.title;
            this.okButonText = options.okButtonText || this.okButonText;
            this.cancelButtonText = options.cancelButtonText || this.cancelButtonText;
            this.$el.addClass(this.model.className + 'Prompt');

        },

        fadeInAndShow: function () {

            $('body').append(this.render().el);
            
            //  Store original values in data attribute to be able to revert without magic numbers.
            this.$el.data('background', this.$el.css('background')).transition({
                'background': 'rgba(0, 0, 0, 0.5)'
            }, 'snap');

            this.panel.data({
                top: this.panel.css('top'),
                opacity: this.panel.css('opacity')
            }).transition({
                top: '50%',
                opacity: 1
            }, 'snap');
            
        },
        
        fadeOutAndHide: function () {

            var self = this;

            this.$el.transition({
                'background': this.$el.data('background')
            }, function () {
                self.remove();
            });

            this.panel.transition({
                top: this.panel.data('top'),
                opacity: this.panel.data('opacity')
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
            var isValid = this.model.validate ? this.model.validate() : true;
            
            if (isValid) {
                this.model.save();
                this.fadeOutAndHide();
            }
            
        }
    });

    return GenericPromptView;
});