define([
    'text!template/prompt/prompt.html'
], function (PromptTemplate) {
    'use strict';

    var PromptView = Backbone.Marionette.LayoutView.extend({
        className: 'prompt u-overlay',
        template: _.template(PromptTemplate),
        //  Provide either contentView to render or contentText to set as HTML.
        contentView: null,
        contentText: '',
        
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
        
        settings: null,
        
        initialize: function () {
            if (this.contentText === '' && this.contentView === null) console.error('No content set.');
            if (this.contentText !== '' && this.contentView !== null) console.error('ContentView and ContextText are set; provide only one');

            this.settings = Streamus.backgroundPage.Settings;
        },

        onShow: function () {
            this._setContent();
            this._transitionIn();
        },
        
        //  Unless a prompt specifically implements reminderProperty it is assumed that the reminder is not disabled and the prompt be shown when asked.
        reminderDisabled: function () {
            var reminderDisabled = false;
            var reminderProperty = this.model.get('reminderProperty');
            
            if (reminderProperty !== false) {
                reminderDisabled = !this.settings.get(reminderProperty);
            }

            return reminderDisabled;
        },
        
        hide: function () {
            this._transitionOut();
        },
        
        onSubmit: _.noop,
        
        validate: function () {
            //  Don't use UI here because is-invalid is appended dynamically and so I can't rely on the cache.
            return this.$el.find('.js-submittable.is-invalid').length === 0;
        },
        
        _transitionIn: function() {
            //  Store original values in data attribute to be able to revert without magic numbers.
            this.$el.data('background', this.$el.css('background')).transition({
                background: 'rgba(0, 0, 0, 0.5)'
            }, 'snap');

            this.ui.panel.transition({
                x: '-50%',
                y: '-50%',
                opacity: 1
            }, 'snap');
        },
        
        _transitionOut: function() {
            this.$el.transition({
                background: this.$el.data('background')
            }, this.destroy.bind(this));

            this.ui.panel.transition({
                y: '-100%',
                opacity: 0
            });
        },
        
        _setContent: function() {
            if (this.contentView) {
                this.contentRegion.show(this.contentView);
            } else {
                this.ui.contentRegion.html(this.contentText);
            }
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
            if (this.validate()) {
                this.onSubmit();
                this.hide();
            }
        },
        
        _saveReminderState: function () {
            var reminderProperty = this.model.get('reminderProperty');
            var remind = !this.ui.reminderCheckbox.is(':checked');

            this.settings.save(reminderProperty, remind);
        }
    });

    return PromptView;
});