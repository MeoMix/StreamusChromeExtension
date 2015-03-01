define(function(require) {
    'use strict';

    var Dialog = require('foreground/model/dialog');
    var DialogContentView = require('foreground/view/dialog/dialogContentView');
    var DialogView = require('foreground/view/dialog/dialogView');

    var ClearStreamDialogView = DialogView.extend({
        id: 'clearStreamDialog',
        stream: null,

        initialize: function() {
            this.model = new Dialog({
                reminderProperty: 'remindClearStream'
            });

            this.contentView = new DialogContentView({
                template: _.template(chrome.i18n.getMessage('clearStreamQuestion'))
            });

            this.stream = Streamus.backgroundPage.stream;

            DialogView.prototype.initialize.apply(this, arguments);
        },

        onSubmit: function() {
            this.stream.get('items').clear();
        }
    });

    return ClearStreamDialogView;
});