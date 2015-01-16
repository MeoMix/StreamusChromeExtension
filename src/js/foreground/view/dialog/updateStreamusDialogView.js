define([
    'foreground/model/dialog',
    'foreground/view/dialog/dialogContentView',
    'foreground/view/dialog/dialogView'
], function (Dialog, DialogContentView, DialogView) {
    'use strict';

    var UpdateStreamusDialogView = DialogView.extend({
        id: 'updateStreamusDialog',

        initialize: function () {
            this.model = new Dialog({
                title: chrome.i18n.getMessage('updateRequired'),
                submitButtonText: chrome.i18n.getMessage('update')
            });

            this.contentView = new DialogContentView({
                template: _.template(chrome.i18n.getMessage('anUpdateToStreamusIsAvailable') + '. ' + chrome.i18n.getMessage('pleaseClickUpdateToReloadAndApplyTheUpdate'))
            });

            DialogView.prototype.initialize.apply(this, arguments);
        },

        onSubmit: function () {
            chrome.runtime.reload();
        }
    });

    return UpdateStreamusDialogView;
});