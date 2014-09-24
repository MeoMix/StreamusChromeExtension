define([
    'text!template/prompt.html'
], function (PromptTemplate) {
    'use strict';

    var Settings = Streamus.backgroundPage.Settings;

    var PromptView = Backbone.Marionette.LayoutView.extend({
        className: 'prompt u-overlay',
        template: _.template(PromptTemplate),
        
        templateHelpers: function () {
            return {
                showReminder: this.model.get('reminderProperty') !== false
            };
        },

        events: {
            'click': '_hideIfClickOutsidePanel',
            'click @ui.closeButton': 'hide',
            'click @ui.okButton': '_submit',
            'change @ui.reminderCheckbox': '_saveReminderState',
            'keydown @ui.submittable': '_submitOnEnter'
        },
        
        ui: {
            panel: '#prompt-panel',
            okButton: '#prompt-okButton',
            reminderCheckbox: '#prompt-reminderCheckbox',
            closeButton: '#prompt-closeButton',
            contentRegion: '#prompt-contentRegion',
            submittable: '.js-submittable'
        },
        
        regions: {
            contentRegion: '@ui.contentRegion'
        },

        onShow: function () {
            //  Store original values in data attribute to be able to revert without magic numbers.
            this.$el.data('background', this.$el.css('background')).transition({
                'background': 'rgba(0, 0, 0, 0.5)'
            }, 'snap');

            //  TODO: I shouldn't have to be setting x here, but transit overrides it when setting Y
            this.ui.panel.transition({
                x: '-50%',
                y: '-50%',
                opacity: 1
            }, 'snap');
            
            this.contentRegion.show(this.model.get('view'));
        },
        
        //  TODO: Invert function for clarity.
        //  Unless a prompt specifically implements reminderProperty it is assumed that the reminder is not disabled and the prompt be shown when asked.
        reminderDisabled: function () {
            var reminderDisabled = false;
            var reminderProperty = this.model.get('reminderProperty');
            
            if (reminderProperty !== false) {
                reminderDisabled = !Settings.get(reminderProperty);
            }

            return reminderDisabled;
        },
        
        hide: function() {
            this.$el.transition({
                'background': this.$el.data('background')
            }, this.destroy.bind(this));

            this.ui.panel.transition({
                y: '-100%',
                opacity: 0
            });
        },
        
        //  If the user clicks the 'dark' area outside the panel -- hide the panel.
        _hideIfClickOutsidePanel: function (event) {
            if (event.target == event.currentTarget) {
                this.hide();
            }
        },
        
        //  If the enter key is pressed on a js-submittable element, treat as if user pressed OK button.
        _submitOnEnter: function(event) {
            if (event.which === 13) {
                this._submit();
            }
        },
        
        _submit: function () {
            //  Run validation logic if provided else assume valid
            var contentView = this.model.get('view');
            var isValid = _.isFunction(contentView.validate) ? contentView.validate() : true;
            
            if (isValid) {
                if (_.isFunction(contentView.onSubmit)) {
                    contentView.onSubmit();
                }

                this.hide();
            }
        },
        
        _saveReminderState: function () {
            var reminderProperty = this.model.get('reminderProperty');
            var remind = !this.ui.reminderCheckbox.is(':checked');

            Settings.save(reminderProperty, remind);
        }
    });

    return PromptView;
});