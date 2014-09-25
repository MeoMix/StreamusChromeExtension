define([
    'foreground/model/prompt',
    'foreground/view/prompt/promptView'
], function (Prompt, PromptView) {
    'use strict';

    var GoogleSignInPromptView = PromptView.extend({
        contentText: chrome.i18n.getMessage('googleSignInMessage'),
        
        initialize: function () {
            this.model =  new Prompt({
                title: chrome.i18n.getMessage('signInToGoogle'),
                reminderProperty: 'remindGoogleSignIn'
            });

            PromptView.prototype.initialize.apply(this, arguments);
        },
        
        onSubmit: function () {
            Streamus.backgroundPage.SignInManager.set('needPromptGoogleSignIn', false);
        }
    });

    return GoogleSignInPromptView;
});