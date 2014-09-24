define([
    'foreground/model/prompt',
    'foreground/view/googleSignInView',
    'foreground/view/prompt/promptView'
], function (Prompt, GoogleSignInView, PromptView) {
    'use strict';

    var GoogleSignInPromptView = PromptView.extend({
        initialize: function () {
            this.model = new Prompt({
                title: chrome.i18n.getMessage('signInToGoogle'),
                reminderProperty: 'remindGoogleSignIn',
                view: new GoogleSignInView()
            });

            PromptView.prototype.initialize.apply(this, arguments);
        }
    });

    return GoogleSignInPromptView;
});