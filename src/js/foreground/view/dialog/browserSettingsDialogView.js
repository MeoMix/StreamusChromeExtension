define(function(require) {
  'use strict';

  var Dialog = require('foreground/model/dialog/dialog');
  var BrowserSettingsView = require('foreground/view/dialog/browserSettingsView');
  var DialogView = require('foreground/view/dialog/dialogView');

  var BrowserSettingsDialogView = DialogView.extend({
    id: 'browserSettingsDialog',

    initialize: function() {
      this.model = new Dialog({
        submitButtonText: chrome.i18n.getMessage('save')
      });

      this.contentView = new BrowserSettingsView({
        model: StreamusFG.backgroundPage.browserSettings
      });

      DialogView.prototype.initialize.apply(this, arguments);
    },

    onSubmit: function() {
      this.contentView.save();
    }
  });

  return BrowserSettingsDialogView;
});