define([
    'foreground/model/dialog',
    'foreground/view/dialog/dialogContentView',
    'foreground/view/dialog/dialogView'
], function (Dialog, DialogContentView, DialogView) {
    'use strict';

    var LinkUserIdDialogView = DialogView.extend({
        id: 'linkUserIdDialog',
        signInManager: null,

        initialize: function () {
            this.model = new Dialog({
                title: chrome.i18n.getMessage('linkAccountToGoogle'),
                reminderProperty: 'remindLinkUserId',
                alwaysSaveReminder: true
            });
            
            this.contentView = new DialogContentView({
                template: _.template(chrome.i18n.getMessage('linkAccountMessage'))
            });

            this.signInManager = Streamus.backgroundPage.signInManager;
            
            DialogView.prototype.initialize.apply(this, arguments);
        },

        onSubmit: function () {
            this.signInManager.saveGooglePlusId();
        }
    });

    return LinkUserIdDialogView;
});