define(function(require) {
    'use strict';

    var Dialog = require('foreground/model/dialog');
    var DialogContentView = require('foreground/view/dialog/dialogContentView');
    var DialogView = require('foreground/view/dialog/dialogView');

    var GoogleSignInDialogView = DialogView.extend({
        id: 'googleSignInDialog',
        signInManager: null,

        initialize: function(options) {
            this.signInManager = options.signInManager;

            this.model = new Dialog({
                reminderProperty: 'remindGoogleSignIn',
                alwaysSaveReminder: true
            });

            this.contentView = new DialogContentView({
                template: _.template(chrome.i18n.getMessage('googleSignInMessage'))
            });

            DialogView.prototype.initialize.apply(this, arguments);
        },

        onSubmit: function() {
            this.signInManager.set('needGoogleSignIn', false);
        }
    });

    return GoogleSignInDialogView;
});