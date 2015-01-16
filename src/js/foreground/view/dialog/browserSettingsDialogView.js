define([
    'foreground/model/dialog',
    'foreground/view/dialog/browserSettingsView',
    'foreground/view/dialog/dialogView'
], function (Dialog, BrowserSettingsView, DialogView) {
    'use strict';

    var BrowserSettingsDialogView = DialogView.extend({
        id: 'browserSettingsDialog',

        initialize: function () {
            this.model = new Dialog({
                title: chrome.i18n.getMessage('browserSettings'),
                submitButtonText: chrome.i18n.getMessage('save')
            });

            this.contentView = new BrowserSettingsView({
                model: Streamus.backgroundPage.browserSettings
            }); 

            DialogView.prototype.initialize.apply(this, arguments);
        },

        onSubmit: function () {
            this.contentView.save();
        }
    });

    return BrowserSettingsDialogView;
});