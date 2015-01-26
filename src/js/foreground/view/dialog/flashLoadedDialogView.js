define(function (require) {
    'use strict';

    var Dialog = require('foreground/model/dialog');
    var DialogContentView = require('foreground/view/dialog/dialogContentView');
    var DialogView = require('foreground/view/dialog/dialogView');

    var FlashLoadedDialogView = DialogView.extend({
        id: 'flashLoadedDialog',

        initialize: function () {
            this.model = new Dialog({
                showCancelButton: false
            });

            this.contentView = new DialogContentView({
                template: _.template(chrome.i18n.getMessage('extensionConflict', ['</br></br>']))
            });

            DialogView.prototype.initialize.apply(this, arguments);
        },
    });

    return FlashLoadedDialogView;
});