define(function(require) {
    'use strict';

    var Dialog = require('foreground/model/dialog/dialog');
    var DialogContent = require('foreground/view/behavior/dialogContent');
    var DialogView = require('foreground/view/dialog/dialogView');

    var ClearStreamDialogView = DialogView.extend({
        id: 'clearStreamDialog',
        streamItems: null,

        initialize: function(options) {
            this.streamItems = options.streamItems;

            this.model = new Dialog({
                reminderProperty: 'remindClearStream'
            });

            this.contentView = new Marionette.LayoutView({
                template: _.template(chrome.i18n.getMessage('clearStreamQuestion')),
                behaviors: {
                    DialogContent: {
                        behaviorClass: DialogContent
                    }
                }
            });

            DialogView.prototype.initialize.apply(this, arguments);
        },

        onSubmit: function() {
            this.streamItems.clear();
        }
    });

    return ClearStreamDialogView;
});