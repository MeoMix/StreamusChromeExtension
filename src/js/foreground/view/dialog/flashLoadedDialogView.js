define([
    'foreground/model/dialog',
    'foreground/view/dialog/dialogContentView',
    'foreground/view/dialog/dialogView'
], function (Dialog, DialogContentView, DialogView) {
    'use strict';

    var FlashLoadedDialogView = DialogView.extend({
        id: 'flashLoadedDialog',

        initialize: function () {
            this.model = new Dialog({
                showCancelButton: false
            });

            this.contentView = new DialogContentView({
                //  TODO: i18n
                template: _.template('Another extension has forced YouTube to use Flash.</br></br> Streamus will not work properly until that extension is disabled and Streamus is restarted.')
            });

            DialogView.prototype.initialize.apply(this, arguments);
        },
    });

    return FlashLoadedDialogView;
});