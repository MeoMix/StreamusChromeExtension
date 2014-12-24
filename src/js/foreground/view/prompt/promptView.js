define([
    'foreground/model/checkbox',
    'foreground/view/element/checkboxView',
    'text!template/prompt/prompt.html'
], function (Checkbox, CheckboxView, PromptTemplate) {
    'use strict';

    var PromptView = Marionette.LayoutView.extend({
        className: 'prompt overlay overlay--faded u-transitionable transition--veryFast',
        template: _.template(PromptTemplate),
        templateHelpers: function () {
            return {
                viewId: this.id
            };
        },

        contentView: null,
        
        regions: function () {
            return {
                reminderRegion: '#' + this.id + '-reminderRegion',
                contentRegion: '#' + this.id + '-contentRegion'
            };
        },
        
        ui: function () {
            return {
                panel: '#' + this.id + '-panel',
                submitButton: '#' + this.id + '-submitButton',
                cancelButton: '#' + this.id + '-cancelButton',
                reminderCheckbox: '#' + this.id + '-reminderCheckbox',
                closeButton: '#' + this.id + '-closeButton',
                submittable: '.js-submittable'
            };
        },

        events: {
            'click': '_onClick',
            'click @ui.closeButton': '_onClickCloseButton',
            'click @ui.cancelButton': '_onClickCancelButton',
            'click @ui.submitButton': '_onClickSubmitButton',
            'keypress @ui.submittable': '_onKeyPressSubmittable'
        },

        settings: null,
        reminderCheckbox: null,
        
        initialize: function () {
            this.settings = Streamus.backgroundPage.settings;
        },

        onShow: function () {
            this.contentRegion.show(this.contentView);
            
            if (this.model.hasReminder()) {
                this._showReminder();
            }
            
            //  Transition only after successfully requesting an animation frame because the browser needs a moment to acknowledge the existence of
            //  the DOM element before its class is modified. Otherwise, the element will be created with the state rather than transitioning to it.
            window.requestAnimationFrame(this._transitionIn.bind(this));
        },
        
        //  Unless a prompt specifically implements reminderProperty it is assumed that reminder is enabled and the prompt be shown when asked.
        isReminderEnabled: function () {
            var isReminderEnabled = true;

            if (this.model.hasReminder()) {
                var reminderProperty = this.model.get('reminderProperty');
                isReminderEnabled = this.settings.get(reminderProperty);
            }

            return isReminderEnabled;
        },
        
        onSubmit: _.noop,

        //  If the user clicks the 'dark' area outside the panel -- hide the panel.
        _onClick: function (event) {
            if (event.target == event.currentTarget) {
                this._hide();
            }
        },
        
        _onClickCloseButton: function () {
            this._hide();
        },
        
        _onClickCancelButton: function () {
            this._hide();
        },
        
        _onClickSubmitButton: function () {
            this._submit();
        },
        
        //  If the enter key is pressed on a js-submittable element, treat as if user pressed OK button.
        _onKeyPressSubmittable: function (event) {
            if (event.which === 13) {
                this._submit();
            }
        },
        
        _transitionIn: function () {
            this.$el.addClass('is-visible');
            this.ui.panel.addClass('is-visible');
        },

        _transitionOut: function () {
            this.$el.on('webkitTransitionEnd', this._onTransitionOutComplete.bind(this));
            this.$el.removeClass('is-visible');
            this.ui.panel.removeClass('is-visible');
        },

        //  Destroy the view only after it has transitioned out fully otherwise it will disappear without a transition.
        _onTransitionOutComplete: function (event) {
            //  webkitTransition bubbles so check the event target to ensure webkitTransitionEnd is running for this element and not a child's transition.
            if (event.target === event.currentTarget) {
                this.destroy();
            }
        },
        
        _showReminder: function() {
            this.reminderCheckbox = new Checkbox({
                primary: false,
                labelText: this.model.get('reminderText'),
                //  Since a prompt will only ever be shown if reminder is needed it is safe to assume true.
                checked: true,
                property: this.model.get('reminderProperty'),
                iconOnLeft: true
            });

            this.reminderRegion.show(new CheckboxView({
                id: this.id + '-reminderCheckbox',
                model: this.reminderCheckbox
            }));
        },
        
        _saveReminderState: function() {
            var property = this.reminderCheckbox.get('property');
            var isChecked = this.reminderCheckbox.get('checked');
            this.settings.save(property, isChecked);
        },
        
        _submit: function () {
            if (this._isValid()) {
                this.onSubmit();
                
                if (this.model.hasReminder()) {
                    this._saveReminderState();
                }

                this._hide();
            }
        },
        
        _isValid: function () {
            //  TODO: Derive this from prompt's ViewModel state instead of asking the DOM.
            //  Don't use UI here because is-invalid is appended dynamically and so I can't rely on the cache.
            return this.$el.find('.js-submittable.is-invalid').length === 0;
        },
        
        _hide: function () {
            this._transitionOut();
        }
    });

    return PromptView;
});