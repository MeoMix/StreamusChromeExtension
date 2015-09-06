import {Model} from 'backbone';

var Dialog = Model.extend({
  defaults: {
    title: '',
    submitButtonText: chrome.i18n.getMessage('ok'),
    cancelButtonText: chrome.i18n.getMessage('cancel'),
    showCancelButton: true,
    reminderProperty: '',
    reminderText: chrome.i18n.getMessage('remind'),
    alwaysSaveReminder: false
  },

  hasReminder: function() {
    return this.get('reminderProperty') !== '';
  }
});

export default Dialog;