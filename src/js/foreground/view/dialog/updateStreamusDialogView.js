define(function(require) {
    'use strict';

    var Dialog = require('foreground/model/dialog/dialog');
    var DialogContent = require('foreground/view/behavior/dialogContent');
    var DialogView = require('foreground/view/dialog/dialogView');

    var UpdateStreamusDialogView = DialogView.extend({
        id: 'updateStreamusDialog',

        initialize: function() {
            this.model = new Dialog({
                submitButtonText: chrome.i18n.getMessage('update')
            });

            this.contentView = new Marionette.LayoutView({
                template: _.template(chrome.i18n.getMessage('anUpdateIsAvailable')),
                behaviors: {
                    DialogContent: {
                        behaviorClass: DialogContent
                    }
                }
            });

            DialogView.prototype.initialize.apply(this, arguments);
        },

        onSubmit: function() {
            chrome.runtime.reload();
        }
    });

    return UpdateStreamusDialogView;
});