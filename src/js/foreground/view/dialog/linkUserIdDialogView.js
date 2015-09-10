import Dialog from 'foreground/model/dialog/dialog';
import LinkUserIdView from 'foreground/view/dialog/linkUserIdView';
import DialogView from 'foreground/view/dialog/dialogView';

var LinkUserIdDialogView = DialogView.extend({
  id: 'linkUserIdDialog',
  signInManager: null,

  initialize: function(options) {
    this.signInManager = options.signInManager;

    this.model = new Dialog({
      reminderProperty: 'remindLinkUserId',
      submitButtonText: chrome.i18n.getMessage('link'),
      alwaysSaveReminder: true
    });

    this.contentView = new LinkUserIdView();

    DialogView.prototype.initialize.apply(this, arguments);
  },

  onSubmit: function() {
    this.signInManager.saveGooglePlusId();
  }
});

export default LinkUserIdDialogView;