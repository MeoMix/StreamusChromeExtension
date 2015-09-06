import Dialog from 'foreground/model/dialog/dialog';
import DialogView from 'foreground/view/dialog/dialogView';
import SettingsView from 'foreground/view/dialog/settingsView';

var SettingsDialogView = DialogView.extend({
  id: 'settingsDialog',

  initialize: function() {
    this.model = new Dialog({
      submitButtonText: chrome.i18n.getMessage('save')
    });

    this.contentView = new SettingsView({
      model: StreamusFG.backgroundProperties.settings,
      signInManager: StreamusFG.backgroundProperties.signInManager
    });

    DialogView.prototype.initialize.apply(this, arguments);
  },

  onSubmit: function() {
    this.contentView.save();
  }
});

export default SettingsDialogView;