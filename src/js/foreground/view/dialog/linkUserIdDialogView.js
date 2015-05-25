define(function(require) {
  'use strict';

  var Dialog = require('foreground/model/dialog/dialog');
  var LinkUserIdView = require('foreground/view/dialog/linkUserIdView');
  var DialogView = require('foreground/view/dialog/dialogView');

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

  return LinkUserIdDialogView;
});