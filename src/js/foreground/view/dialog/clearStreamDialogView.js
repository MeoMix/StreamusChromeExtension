define(function(require) {
    'use strict';

    var Dialog = require('foreground/model/dialog');
    var DialogContentView = require('foreground/view/dialog/dialogContentView');
    var DialogView = require('foreground/view/dialog/dialogView');

    //  TODO: Rename this to ClearStreamItems
    var ClearStreamDialogView = DialogView.extend({
        id: 'clearStreamDialog',
        streamItems: null,

        initialize: function(options) {
            this.streamItems = options.streamItems;

            this.model = new Dialog({
                reminderProperty: 'remindClearStream'
            });

            this.contentView = new DialogContentView({
                template: _.template(chrome.i18n.getMessage('clearStreamQuestion'))
            });

            DialogView.prototype.initialize.apply(this, arguments);
        },

        onSubmit: function() {
            this.streamItems.clear();
        }
    });

    return ClearStreamDialogView;
});