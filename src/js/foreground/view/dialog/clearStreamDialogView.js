define([
    'foreground/model/dialog',
    'foreground/view/dialog/dialogContentView',
    'foreground/view/dialog/dialogView'
], function (Dialog, DialogContentView, DialogView) {
    'use strict';
    
    var ClearStreamDialogView = DialogView.extend({
        id: 'clearStreamDialog',
        stream: null,
        
        initialize: function () {
            this.model = new Dialog({
                reminderProperty: 'remindClearStream'
            });

            this.contentView = new DialogContentView({
                template: _.template(chrome.i18n.getMessage('clearStreamQuestion'))
            });

            this.stream = Streamus.backgroundPage.stream;

            DialogView.prototype.initialize.apply(this, arguments);
        },
        
        onSubmit: function () {
            this.stream.get('items').clear();
        }
    });

    return ClearStreamDialogView;
});