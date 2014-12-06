define([
    'foreground/model/prompt',
    'foreground/view/prompt/promptView'
], function (Prompt, PromptView) {
    'use strict';

    var GoogleSignInPromptView = PromptView.extend({
        id: 'googleSignInPrompt',
        signInManager: null,
        
        initialize: function () {
            this.model =  new Prompt({
                title: chrome.i18n.getMessage('signInToGoogle'),
                reminderProperty: 'remindGoogleSignIn'
            });
            
            this.contentView = new Marionette.ItemView({
                template: _.template(chrome.i18n.getMessage('googleSignInMessage'))
            });

            this.signInManager = Streamus.backgroundPage.signInManager;

            PromptView.prototype.initialize.apply(this, arguments);
        },
        
        onSubmit: function () {
            this.signInManager.set('needPromptGoogleSignIn', false);
        }
    });

    return GoogleSignInPromptView;
});