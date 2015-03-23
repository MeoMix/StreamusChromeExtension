define(function(require) {
    'use strict';

    var SpinnerView = require('foreground/view/element/spinnerView');
    var SignInTemplate = require('text!template/leftPane/signIn.html');

    var SignInView = Marionette.LayoutView.extend({
        id: 'signIn',
        className: 'flexColumn',
        template: _.template(SignInTemplate),

        templateHelpers: {
            signingInMessage: chrome.i18n.getMessage('signingIn'),
            signInMessage: chrome.i18n.getMessage('signIn'),
            signInFailedMessage: chrome.i18n.getMessage('signInFailed'),
            pleaseWaitMessage: chrome.i18n.getMessage('pleaseWait')
        },

        regions: function() {
            return {
                spinnerRegion: '#' + this.id + '-spinnerRegion'
            };
        },

        ui: function() {
            return {
                signingInMessage: '#' + this.id + '-signingInMessage',
                signInMessage: '#' + this.id + '-signInMessage',
                signInFailedMessage: '#' + this.id + '-signInFailedMessage',
                signInLink: '#' + this.id + '-signInLink',
                signInRetryTimer: '#' + this.id + '-signInRetryTimer'
            };
        },

        events: {
            'click @ui.signInLink': '_onClickSignInLink'
        },

        modelEvents: {
            'change:signInFailed': '_onChangeSignInFailed',
            'change:signingIn': '_onChangeSigningIn',
            'change:signInRetryTimer': '_onChangeSignInRetryTimer'
        },

        onRender: function() {
            this._toggleBigText(this.model.get('signingIn'), this.model.get('signInFailed'));
            this.spinnerRegion.show(new SpinnerView());
        },

        _onClickSignInLink: function() {
            this._signIn();
        },

        _onChangeSignInFailed: function(model, signInFailed) {
            this._toggleBigText(model.get('signingIn'), signInFailed);
        },

        _onChangeSigningIn: function(model, signingIn) {
            this._toggleBigText(signingIn, model.get('signInFailed'));
        },

        _onChangeSignInRetryTimer: function(model, signInRetryTimer) {
            this._setSignInRetryTimer(signInRetryTimer);
        },

        _setSignInRetryTimer: function(signInRetryTimer) {
            this.ui.signInRetryTimer.text(signInRetryTimer);
        },

        //  Set the visibility of any visible text messages.
        _toggleBigText: function(signingIn, signInFailed) {
            this.ui.signInFailedMessage.toggleClass('is-hidden', !signInFailed);
            this.ui.signingInMessage.toggleClass('is-hidden', !signingIn);
            this.ui.signInMessage.toggleClass('is-hidden', signingIn || signInFailed);
        },

        _signIn: function() {
            this.model.signInWithGoogle();
        }
    });

    return SignInView;
});