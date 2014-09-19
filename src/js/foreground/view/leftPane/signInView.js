define([
    'text!template/signIn.html'
], function (SignInTemplate) {
    'use strict';

    var SignInView = Backbone.Marionette.ItemView.extend({
        id: 'signIn',
        template: _.template(SignInTemplate),
        
        templateHelpers: function () {
            return {
                signingInMessage: chrome.i18n.getMessage('signingIn'),
                signInMessage: chrome.i18n.getMessage('signIn'),
                signInFailedMessage: chrome.i18n.getMessage('signInFailed'),
                pleaseWaitMessage: chrome.i18n.getMessage('pleaseWait')
            };
        },

        ui: {
            signingInMessage: '#signIn-signingInMessage',
            signInMessage: '#signIn-signInMessage',
            signInFailedMessage: '#signIn-signInFailedMessage',
            signInLink: '#signIn-signInLink',
            signInRetryTimer: '#signIn-signInRetryTimer'
        },

        events: {
            'click @ui.signInLink': '_signIn'
        },

        modelEvents: {
            'change:signInFailed': '_toggleBigText',
            'change:signingIn': '_toggleBigText',
            'change:signInRetryTimer': '_updateSignInRetryTimer'
        },
        
        onRender: function () {
            this._toggleBigText();
        },

        _updateSignInRetryTimer: function () {
            this.ui.signInRetryTimer.text(this.model.get('signInRetryTimer'));
        },

        //  Set the visibility of any visible text messages.
        _toggleBigText: function () {
            var signingIn = this.model.get('signingIn');
            var signInFailed = this.model.get('signInFailed');
            
            this.ui.signInFailedMessage.toggleClass('hidden', !signInFailed);
            this.ui.signingInMessage.toggleClass('hidden', !signingIn);
            this.ui.signInMessage.toggleClass('hidden', signingIn || signInFailed);
        },

        _signIn: function () {
            this.model.signInWithGoogle();
        }
    });

    return SignInView;
});