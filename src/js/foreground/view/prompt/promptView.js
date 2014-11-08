define([
    'text!template/prompt/prompt.html'
], function (PromptTemplate) {
    'use strict';

    var PromptView = Backbone.Marionette.LayoutView.extend({
        className: 'prompt overlay overlay--faded u-transitionable',
        template: _.template(PromptTemplate),
        //  Provide either contentView to render or contentText to set as HTML.
        contentView: null,
        contentText: '',
        
        templateHelpers: function () {
            return {
                showReminder: this.model.get('reminderProperty') !== false
            };
        },
        
        ui: {
            panel: '#prompt-panel',
            okButton: '#prompt-okButton',
            reminderCheckbox: '#prompt-reminderCheckbox',
            closeButton: '#prompt-closeButton',
            contentRegion: '#prompt-contentRegion',
            submittable: '.js-submittable'
        },

        events: {
            'click': '_onClick',
            'click @ui.closeButton': '_onClickCloseButton',
            'click @ui.okButton': '_onClickOkButton',
            'input @ui.reminderCheckbox': '_onInputReminderCheckbox',
            'keypress @ui.submittable': '_onKeyPressSubmittable'
        },
        
        regions: {
            contentRegion: '@ui.contentRegion'
        },
        
        settings: null,
        transitionDuration: 400,
        
        initialize: function () {
            //  TODO: This feels a bit weird.
            if (this.contentText === '' && this.contentView === null) console.error('No content set.');
            if (this.contentText !== '' && this.contentView !== null) console.error('ContentView and ContextText are set; provide only one');

            this.settings = Streamus.backgroundPage.settings;
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
        
        _transitionIn: function () {
            this.$el.addClass('is-visible');

            this.$el.transition({
                opacity: 1
            }, {
                easing: 'easeOutCubic',
                duration: this.transitionDuration
            });

            this.ui.panel.transition({
                x: '-50%',
                y: '-50%'
            }, {
                easing: 'easeOutCubic',
                duration: this.transitionDuration
            });
        },

        _transitionOut: function () {
            this.$el.removeClass('is-visible');

            this.$el.transition({
                opacity: 0
            }, {
                easing: 'easeOutCubic',
                duration: this.transitionDuration,
                complete: this.destroy.bind(this)
            });

            this.ui.panel.transition({
                y: '-100%'
            }, {
                easing: 'easeOutCubic',
                duration: this.transitionDuration
            });
        },
        
        _setContent: function() {
            if (this.contentView) {
                this.contentRegion.show(this.contentView);
            } else {
                //  TODO: Uhhh. I don't think I should ever access a Region through HTML.
                this.ui.contentRegion.html(this.contentText);
            }
        },
        
        //  If the user clicks the 'dark' area outside the panel -- hide the panel.
        _onClick: function (event) {
            if (event.target == event.currentTarget) {
                this.hide();
            }
        },
        
        _onClickCloseButton: function () {
            this.hide();
        },
        
        _onClickOkButton: function () {
            this._submit();
        },
        
        _onInputReminderCheckbox: function () {
            this._saveReminderState();
        },
        
        //  If the enter key is pressed on a js-submittable element, treat as if user pressed OK button.
        _onKeyPressSubmittable: function (event) {
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