define([
    'text!template/signIn.html'
], function (SignInTemplate) {
    'use strict';

    var SignInView = Backbone.Marionette.ItemView.extend({
        id: 'sign-in',
        template: _.template(SignInTemplate),

        ui: {
            signingInMessage: '.signing-in',
            signInPrompt: '.sign-in',
            signInLink: '.sign-in .clickable',
            signInFailedMessage: '.sign-in-failed',
            signInRetryTimer: '#sign-in-retry-timer'
        },

        events: {
            'click @ui.signInLink': 'signIn'
        },

        modelEvents: {
            'change:signInFailed': 'toggleBigText',
            'change:signingIn': 'toggleBigText',
            'change:signInRetryTimer': 'updateSignInRetryTimer'
        },

        templateHelpers: function () {
            return {
                signingInMessage: chrome.i18n.getMessage('signingIn'),
                signInMessage: chrome.i18n.getMessage('signIn'),
                signInFailedMessage: chrome.i18n.getMessage('signInFailed'),
                pleaseWaitMessage: chrome.i18n.getMessage('pleaseWait')
            };
        },
        
        onRender: function () {
            this.toggleBigText();
        },

        updateSignInRetryTimer: function () {
            this.ui.signInRetryTimer.text(this.model.get('signInRetryTimer'));
        },

        //  Set the visibility of any visible text messages.
        toggleBigText: function () {

            var signingIn = this.model.get('signingIn');
            var signInFailed = this.model.get('signInFailed');

            this.ui.signInFailedMessage.toggleClass('hidden', !signInFailed);
            this.ui.signingInMessage.toggleClass('hidden', !signingIn);
            this.ui.signInPrompt.toggleClass('hidden', signingIn);
        },

        signIn: function () {
            this.model.signInWithGoogle();
        }
    });

    return SignInView;
});