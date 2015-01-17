define(function (require) {
    'use strict';

    var Dialog = require('foreground/model/dialog');
    var DialogContentView = require('foreground/view/dialog/dialogContentView');
    var DialogView = require('foreground/view/dialog/dialogView');

    var GoogleSignInDialogView = DialogView.extend({
        id: 'googleSignInDialog',
        signInManager: null,
        
        initialize: function () {
            this.model =  new Dialog({
                title: chrome.i18n.getMessage('signInToGoogle'),
                reminderProperty: 'remindGoogleSignIn',
                alwaysSaveReminder: true
            });
            
            this.contentView = new DialogContentView({
                template: _.template(chrome.i18n.getMessage('googleSignInMessage'))
            });

            this.signInManager = Streamus.backgroundPage.signInManager;

            DialogView.prototype.initialize.apply(this, arguments);
        },
        
        onSubmit: function () {
            this.signInManager.set('needGoogleSignIn', false);
        }
    });

    return GoogleSignInDialogView;
});