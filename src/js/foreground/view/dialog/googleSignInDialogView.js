'use strict';
import Dialog from 'foreground/model/dialog/dialog';
import GoogleSignInView from 'foreground/view/dialog/googleSignInView';
import DialogView from 'foreground/view/dialog/dialogView';

var GoogleSignInDialogView = DialogView.extend({
  id: 'googleSignInDialog',
  signInManager: null,

  initialize: function(options) {
    this.signInManager = options.signInManager;

    this.model = new Dialog({
      reminderProperty: 'remindGoogleSignIn',
      alwaysSaveReminder: true
    });

    this.contentView = new GoogleSignInView();

    DialogView.prototype.initialize.apply(this, arguments);
  },

  onSubmit: function() {
    this.signInManager.set('needGoogleSignIn', false);
  }
});

export default GoogleSignInDialogView;