import Dialog from 'foreground/model/dialog/dialog';
import UpdateStreamusView from 'foreground/view/dialog/updateStreamusView';
import DialogView from 'foreground/view/dialog/dialogView';

var UpdateStreamusDialogView = DialogView.extend({
  id: 'updateStreamusDialog',

  initialize: function() {
    this.model = new Dialog({
      submitButtonText: chrome.i18n.getMessage('update')
    });

    this.contentView = new UpdateStreamusView();

    DialogView.prototype.initialize.apply(this, arguments);
  },

  onSubmit: function() {
    chrome.runtime.reload();
  }
});

export default UpdateStreamusDialogView;