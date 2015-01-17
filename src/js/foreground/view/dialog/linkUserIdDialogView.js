define(function (require) {
    'use strict';

    var Dialog = require('foreground/model/dialog');
    var DialogContentView = require('foreground/view/dialog/dialogContentView');
    var DialogView = require('foreground/view/dialog/dialogView');

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