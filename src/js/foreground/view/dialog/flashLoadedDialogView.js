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
                //  TODO: i18n
                template: _.template('Another extension has forced YouTube to use Flash.</br></br> Streamus will not work properly until that extension is disabled and Streamus is restarted.')
            });

            DialogView.prototype.initialize.apply(this, arguments);
        },
    });

    return FlashLoadedDialogView;
});