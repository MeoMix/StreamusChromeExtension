define([
    'text!template/googleSignIn.html'
], function (GoogleSignInTemplate) {
    'use strict';
    
    var SignInManager = Streamus.backgroundPage.SignInManager;
    var Settings = Streamus.backgroundPage.Settings;
    
    var GoogleSignInView = Backbone.Marionette.ItemView.extend({
        className: 'google-sign-in wrap-white-space',
        template: _.template(GoogleSignInTemplate),

        templateHelpers: {
            googleSignInMessage: chrome.i18n.getMessage('googleSignInMessage')
        },
        
        _doOnHide: function (remindGoogleSignIn) {
            Settings.set('remindGoogleSignIn', remindGoogleSignIn);
        },
        
        _doRenderedOk: function () {
            SignInManager.set('needPromptGoogleSignIn', false);
        }
    });

    return GoogleSignInView;
});