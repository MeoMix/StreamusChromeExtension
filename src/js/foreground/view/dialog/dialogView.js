import _ from 'common/shim/lodash.reference.shim';
import {LayoutView} from 'marionette';
import Checkbox from 'foreground/model/element/checkbox';
import CheckboxView from 'foreground/view/element/checkboxView';
import KeyCode from 'foreground/enum/keyCode';
import {dialog_dialog as DialogTemplate} from 'common/templates';

var DialogView = LayoutView.extend({
  className: 'dialog overlay overlay--faded',
  template: DialogTemplate,
  contentView: null,

  regions: {
    reminder: 'reminder',
    content: 'content'
  },

  ui: {
    panel: 'panel',
    submitButton: 'submitButton',
    cancelButton: 'cancelButton',
    submittable: 'submittable'
  },

  events: {
    'mousedown': '_onMouseDown',
    'mouseup': '_onMouseUp',
    'click @ui.cancelButton': '_onClickCancelButton',
    'click @ui.submitButton': '_onClickSubmitButton',
    'keypress @ui.submittable': '_onKeyPressSubmittable'
  },

  settings: null,
  reminderCheckbox: null,
  mouseDownTarget: null,

  initialize: function() {
    // Prefer passing background models in as options, but reminders will be removed once undo is implemented.
    // So, no need to refactor this right now. Just remove later.
    this.settings = StreamusFG.backgroundProperties.settings;
  },

  onRender: function() {
    this.showChildView('content', this.contentView);

    if (this.model.hasReminder()) {
      this._showReminder();
    }
  },

  onAttach: function() {
    requestAnimationFrame(this._transitionIn.bind(this));
  },

  // Assume reminder is enabled (dialog will be shown) if reminderProperty is not impemented.
  isReminderEnabled: function() {
    var isReminderEnabled = true;

    if (this.model.hasReminder()) {
      var reminderProperty = this.model.get('reminderProperty');
      isReminderEnabled = this.settings.get(reminderProperty);
    }

    return isReminderEnabled;
  },

  onSubmit: _.noop,

  // If the user clicks on the darkened area then close the dialog.
  // Use onMouseDown and onMouseUp because the user can click down on the scrollbar and drag their mouse such that it is over
  // the darkened panel. This will cause an incorrect close because they didn't click on the dark panel.
  _onMouseDown: function(event) {
    this.mouseDownTarget = event.target;
  },

  _onMouseUp: function(event) {
    if (this.mouseDownTarget === event.currentTarget && event.currentTarget === event.target) {
      this._hide();
    }

    this.mouseDownTarget = null;
  },

  _onClickCancelButton: function() {
    this._hide();
  },

  _onClickSubmitButton: function() {
    this._submit();
  },

  // If the enter key is pressed on a js-submittable element, treat as if user pressed OK button.
  _onKeyPressSubmittable: function(event) {
    if (event.which === KeyCode.Enter) {
      this._submit();
    }
  },

  _transitionIn: function() {
    if (!this.isDestroyed) {
      this.$el.addClass('is-visible');
      this.ui.panel.addClass('is-visible');

      // This hook is useful because _transitionIn is called via requestAnimationFrame.
      // This means that the view is not fully visible when the 'onShow' event fires.
      this.triggerMethod('visible');
    }
  },

  _transitionOut: function() {
    this.$el.on('webkitTransitionEnd', this._onTransitionOutComplete.bind(this));
    this.$el.removeClass('is-visible');
    this.ui.panel.removeClass('is-visible');
  },

  // Destroy the view only after it has transitioned out fully otherwise it will disappear without a transition.
  _onTransitionOutComplete: function(event) {
    // Event can bubble so check the target to ensure event is not running for a child's transition.
    if (event.target === event.currentTarget) {
      this.destroy();
    }
  },

  _showReminder: function() {
    this.reminderCheckbox = new Checkbox({
      primary: false,
      labelText: this.model.get('reminderText'),
      // Since a dialog will only ever be shown if reminder is needed it is safe to assume true.
      checked: true,
      property: this.model.get('reminderProperty'),
      iconOnLeft: true
    });

    this.showChildView('reminder', new CheckboxView({
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
    } else {
      this.contentView.triggerMethod('validation:failed');
    }
  },

  _isValid: function() {
    var isValid = true;

    var contentViewModel = this.contentView.model;
    if (!_.isUndefined(contentViewModel)) {
      isValid = contentViewModel.has('valid') ? contentViewModel.get('valid') : true;
    }

    return isValid;
  },

  _hide: function() {
    // Some dialogs you don't want to run obSubmit logic for when closing, but also don't always want to be reminded.
    if (this.model.get('alwaysSaveReminder')) {
      this._saveReminderState();
    }

    this._transitionOut();
  }
});

export default DialogView;