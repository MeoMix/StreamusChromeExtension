define([
    'foreground/model/prompt',
    'foreground/view/googleSignInView',
    'foreground/view/prompt/promptView'
], function (Prompt, GoogleSignInView, PromptView) {
    'use strict';

    var Settings = Streamus.backgroundPage.Settings;

    var GoogleSignInPromptView = PromptView.extend({
        initialize: function () {
            this.model = new Prompt({
                title: chrome.i18n.getMessage('signInToGoogle'),
                showReminder: true,
                view: new GoogleSignInView()
            });

            PromptView.prototype.initialize.apply(this, arguments);
        },

        reminderDisabled: function () {
            return !Settings.get('remindGoogleSignIn');
        }
    });

    return GoogleSignInPromptView;
});