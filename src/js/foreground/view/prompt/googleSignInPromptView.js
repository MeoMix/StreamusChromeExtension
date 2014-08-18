define([
    'foreground/model/genericPrompt',
    'foreground/view/googleSignInView',
    'foreground/view/prompt/genericPromptView'
], function (GenericPrompt, GoogleSignInView, GenericPromptView) {
    'use strict';

    var Settings = Streamus.backgroundPage.Settings;

    var GoogleSignInPromptView = GenericPromptView.extend({
        initialize: function () {
            this.model = new GenericPrompt({
                title: chrome.i18n.getMessage('signInToGoogle'),
                view: new GoogleSignInView()
            });

            GenericPromptView.prototype.initialize.apply(this, arguments);
        },

        reminderDisabled: function () {
            return !Settings.get('remindGoogleSignIn');
        }
    });

    return GoogleSignInPromptView;
});