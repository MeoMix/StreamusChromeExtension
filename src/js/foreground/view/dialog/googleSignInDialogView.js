define(function(require) {
    'use strict';

    var Dialog = require('foreground/model/dialog/dialog');
    var DialogContent = require('foreground/view/behavior/dialogContent');
    var DialogView = require('foreground/view/dialog/dialogView');

    var GoogleSignInDialogView = DialogView.extend({
        id: 'googleSignInDialog',
        signInManager: null,

        initialize: function(options) {
            this.signInManager = options.signInManager;

            this.model = new Dialog({
                reminderProperty: 'remindGoogleSignIn',
                alwaysSaveReminder: true
            });

            this.contentView = new Marionette.LayoutView({
                template: _.template(chrome.i18n.getMessage('googleSignInMessage')),
                behaviors: {
                    DialogContent: {
                        behaviorClass: DialogContent
                    }
                }
            });

            DialogView.prototype.initialize.apply(this, arguments);
        },

        onSubmit: function() {
            this.signInManager.set('needGoogleSignIn', false);
        }
    });

    return GoogleSignInDialogView;
});