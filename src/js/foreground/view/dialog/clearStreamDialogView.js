import Dialog from 'foreground/model/dialog/dialog';
import ClearStreamView from 'foreground/view/dialog/clearStreamView';
import DialogView from 'foreground/view/dialog/dialogView';

var ClearStreamDialogView = DialogView.extend({
  id: 'clearStreamDialog',
  streamItems: null,

  initialize: function(options) {
    this.streamItems = options.streamItems;

    this.model = new Dialog({
      reminderProperty: 'remindClearStream'
    });

    this.contentView = new ClearStreamView();

    DialogView.prototype.initialize.apply(this, arguments);
  },

  onSubmit: function() {
    this.streamItems.clear();
  }
});

export default ClearStreamDialogView;