define([
    'foreground/model/dialog',
    'foreground/view/dialog/dialogContentView',
    'foreground/view/dialog/dialogView'
], function (Dialog, DialogContentView, DialogView) {
    'use strict';

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