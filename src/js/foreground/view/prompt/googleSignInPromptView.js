define([
    'foreground/model/prompt',
    'foreground/view/prompt/promptView'
], function (Prompt, PromptView) {
    'use strict';

    var GoogleSignInPromptView = PromptView.extend({
        contentText: chrome.i18n.getMessage('googleSignInMessage'),
        
        model: new Prompt({
            title: chrome.i18n.getMessage('signInToGoogle'),
            reminderProperty: 'remindGoogleSignIn'
        }),
        
        onSubmit: function () {
            Streamus.backgroundPage.SignInManager.set('needPromptGoogleSignIn', false);
        }
    });

    return GoogleSignInPromptView;
});