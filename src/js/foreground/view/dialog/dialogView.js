define(function(require) {
    'use strict';

    var Checkbox = require('foreground/model/checkbox');
    var CheckboxView = require('foreground/view/element/checkboxView');
    var DialogTemplate = require('text!template/dialog/dialog.html');

    var DialogView = Marionette.LayoutView.extend({
        className: 'dialog overlay overlay--faded u-transitionable transition--veryFast',
        template: _.template(DialogTemplate),
        templateHelpers: function() {
            return {
                viewId: this.id
            };
        },

        contentView: null,

        regions: function() {
            return {
                reminderRegion: '#' + this.id + '-reminderRegion',
                contentRegion: '#' + this.id + '-contentRegion'
            };
        },

        ui: function() {
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
            'mousedown': '_onMouseDown',
            'mouseup': '_onMouseUp',
            'click @ui.closeButton': '_onClickCloseButton',
            'click @ui.cancelButton': '_onClickCancelButton',
            'click @ui.submitButton': '_onClickSubmitButton',
            'keypress @ui.submittable': '_onKeyPressSubmittable'
        },

        settings: null,
        reminderCheckbox: null,
        mouseDownTarget: null,

        initialize: function() {
            this.settings = Streamus.backgroundPage.settings;
        },

        onRender: function() {
            this.showChildView('contentRegion', this.contentView);

            if (this.model.hasReminder()) {
                this._showReminder();
            }
        },

        onAttach: function() {
            requestAnimationFrame(this._transitionIn.bind(this));
        },
        
        //  Unless a dialog specifically implements reminderProperty it is assumed that reminder is enabled and the dialog will be shown when asked.
        isReminderEnabled: function() {
            var isReminderEnabled = true;

            if (this.model.hasReminder()) {
                var reminderProperty = this.model.get('reminderProperty');
                isReminderEnabled = this.settings.get(reminderProperty);
            }

            return isReminderEnabled;
        },

        onSubmit: _.noop,

        //  TODO: Propagate this logic throughout application. It's more complex, but it's correct UX.
        //  If the user clicks on the darkened area then close the dialog.
        //  Use onMouseDown and onMouseUp because the user can click down on the scrollbar and drag their mouse such that it is over
        //  the darkened panel. This will cause an incorrect close because they didn't click on the dark panel.
        _onMouseDown: function(event) {
            this.mouseDownTarget = event.target;
        },

        _onMouseUp: function(event) {
            if (this.mouseDownTarget === event.currentTarget && event.currentTarget === event.target) {
                this._hide();
            }

            this.mouseDownTarget = null;
        },

        _onClickCloseButton: function() {
            this._hide();
        },

        _onClickCancelButton: function() {
            this._hide();
        },

        _onClickSubmitButton: function() {
            this._submit();
        },
        
        //  If the enter key is pressed on a js-submittable element, treat as if user pressed OK button.
        _onKeyPressSubmittable: function(event) {
            if (event.which === 13) {
                this._submit();
            }
        },

        _transitionIn: function() {
            if (!this.isDestroyed) {
                this.$el.addClass('is-visible');
                this.ui.panel.addClass('is-visible');

                //  This hook is useful because _transitionIn is called via requestAnimationFrame. So, when onShow finishes, the view isn't fully visible yet.
                this.triggerMethod('visible');
            }
        },

        _transitionOut: function() {
            this.$el.on('webkitTransitionEnd', this._onTransitionOutComplete.bind(this));
            this.$el.removeClass('is-visible');
            this.ui.panel.removeClass('is-visible');
        },

        //  Destroy the view only after it has transitioned out fully otherwise it will disappear without a transition.
        _onTransitionOutComplete: function(event) {
            //  webkitTransition bubbles so check the event target to ensure webkitTransitionEnd is running for this element and not a child's transition.
            if (event.target === event.currentTarget) {
                this.destroy();
            }
        },

        _showReminder: function() {
            this.reminderCheckbox = new Checkbox({
                primary: false,
                labelText: this.model.get('reminderText'),
                //  Since a dialog will only ever be shown if reminder is needed it is safe to assume true.
                checked: true,
                property: this.model.get('reminderProperty'),
                iconOnLeft: true
            });

            this.showChildView('reminderRegion', new CheckboxView({
                id: this.id + '-reminderCheckbox',
                model: this.reminderCheckbox
            }));
        },

        _saveReminderState: function() {
            var property = this.reminderCheckbox.get('property');
            var isChecked = this.reminderCheckbox.get('checked');
            this.settings.save(property, isChecked);
        },

        _submit: function() {
            if (this._isValid()) {
                this.onSubmit();

                if (this.model.hasReminder()) {
                    this._saveReminderState();
                }

                this._hide();
            }
        },

        _isValid: function() {
            //  TODO: Derive this from dialog's ViewModel state instead of asking the DOM.
            //  Don't use UI here because is-invalid is appended dynamically and so I can't rely on the cache.
            return this.$el.find('.js-submittable.is-invalid').length === 0;
        },

        _hide: function() {
            //  TODO: This is just a patch for now. Some dialogs you don't want to run onSubmit for but you also don't want to always be reminded.
            if (this.model.get('alwaysSaveReminder')) {
                this._saveReminderState();
            }

            this._transitionOut();
        }
    });

    return DialogView;
});