define([
    'text!template/googleSignIn.html'
], function (GoogleSignInTemplate) {
    'use strict';
    
    var SignInManager = chrome.extension.getBackgroundPage().SignInManager;
    var Settings = chrome.extension.getBackgroundPage().Settings;
    
    var GoogleSignInView = Backbone.Marionette.ItemView.extend({
        className: 'google-sign-in',
        template: _.template(GoogleSignInTemplate),

        templateHelpers: {
            googleSignInMessage: chrome.i18n.getMessage('googleSignInMessage'),
            dontRemindMeAgainMessage: chrome.i18n.getMessage('dontRemindMeAgain')
        },
        
        ui: {
            reminderCheckbox: '.reminder input[type="checkbox"]'
        },
        
        _doOnHide: function() {
            var remindGoogleSignIn = !this.ui.reminderCheckbox.is(':checked');
            Settings.set('remindGoogleSignIn', remindGoogleSignIn);
        },
        
        _doRenderedOk: function () {
            SignInManager.set('needPromptGoogleSignIn', false);
        }
    });

    return GoogleSignInView;
});