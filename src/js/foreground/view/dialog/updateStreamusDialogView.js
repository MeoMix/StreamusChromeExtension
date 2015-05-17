define(function(require) {
    'use strict';

    var Dialog = require('foreground/model/dialog/dialog');
    var DialogContentView = require('foreground/view/dialog/dialogContentView');
    var DialogView = require('foreground/view/dialog/dialogView');

    var UpdateStreamusDialogView = DialogView.extend({
        id: 'updateStreamusDialog',

        initialize: function() {
            this.model = new Dialog({
                submitButtonText: chrome.i18n.getMessage('update')
            });

            this.contentView = new DialogContentView({
                template: _.template(chrome.i18n.getMessage('anUpdateIsAvailable'))
            });

            DialogView.prototype.initialize.apply(this, arguments);
        },

        onSubmit: function() {
            chrome.runtime.reload();
        }
    });

    return UpdateStreamusDialogView;
});