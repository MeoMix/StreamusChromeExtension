define([
    'common/enum/youTubePlayerError',
    'foreground/view/prompt/errorPromptView',
    'foreground/view/prompt/googleSignInPromptView',
    'foreground/view/prompt/linkUserIdPromptView',
    'foreground/view/prompt/updateStreamusPromptView'
], function (YouTubePlayerError, ErrorPromptView, GoogleSignInPromptView, LinkUserIdPromptView, UpdateStreamusPromptView) {
    'use strict';
    
    var Player = Streamus.backgroundPage.Player;
    var SignInManager = Streamus.backgroundPage.SignInManager;

    var PromptRegion = Backbone.Marionette.Region.extend({
        el: '#foregroundArea-promptRegion',
        
        initialize: function () {
            //  TODO: show should be a command not an event.
            this.listenTo(Backbone.Wreqr.radio.channel('prompt').commands, 'show:prompt', this._showPrompt);
            this.listenTo(Backbone.Wreqr.radio.channel('foregroundArea').vent, 'shown', this._onForegroundAreaShown);
            this.listenTo(Player, 'youTubeError', this._showYouTubeErrorPrompt);
            this.listenTo(SignInManager, 'change:needPromptLinkUserId', this._onChangeNeedPromptLinkUserId);
            this.listenTo(SignInManager, 'change:needPromptGoogleSignIn', this._onChangeNeedPromptGoogleSignIn);
            chrome.runtime.onUpdateAvailable.addListener(this._onChromeUpdateAvailable.bind(this));
        },
        
        _onForegroundAreaShown: function () {
            this._promptIfNeedGoogleSignIn();
            this._promptIfNeedLinkUserId();
            this._promptIfUpdateAvailable();
        },

        //  Make sure Streamus stays up to date because if my Server de-syncs people won't be able to save properly.
        //  http://developer.chrome.com/extensions/runtime#method-requestUpdateCheck
        _promptIfUpdateAvailable: function () {
            //  Don't need to handle the update check -- just need to call it so that onUpdateAvailable will fire.
            chrome.runtime.requestUpdateCheck(function () { });
        },
        
        //  If SignInManager indicates that sign-in state has changed and necessitates asking the user to link their account to Google, do so.
        //  This might happen while the foreground UI isn't open (most likely, in fact), so need to check state upon foreground UI opening.
        _promptIfNeedLinkUserId: function() {
            if (SignInManager.get('needPromptLinkUserId')) {
                this._showLinkUserIdPrompt();
            }
        },
        
        _promptIfNeedGoogleSignIn: function() {
            if (SignInManager.get('needPromptGoogleSignIn')) {
                this._showGoogleSignInPrompt();
            }
        },
        
        _onChromeUpdateAvailable: function() {
            this._showUpdateStreamusPrompt();
        },
        
        _onChangeNeedPromptLinkUserId: function (model, needPromptLinkUserId) {
            if (needPromptLinkUserId) {
                this._showLinkUserIdPrompt();
            }
        },
        
        _onChangeNeedPromptGoogleSignIn: function (model, needPromptGoogleSignIn) {
            if (needPromptGoogleSignIn) {
                this._showGoogleSignInPrompt();
            }
        },
        
        //  Prompt the user to confirm that they want to link their Google+ ID to the currently signed in account.
        _showLinkUserIdPrompt: function () {
            this._showPrompt(LinkUserIdPromptView);
        },
        
        _showGoogleSignInPrompt: function () {
            this._showPrompt(GoogleSignInPromptView);
        },
        
        //  Display a prompt to the user indicating that they should restart Streamus because an update has been downloaded.
        _showUpdateStreamusPrompt: function () {
            this._showPrompt(UpdateStreamusPromptView);
        },
        
        _showPrompt: function (PromptView, options) {
            var promptView = new PromptView(options);

            //  Sometimes checkbox reminders are in place which would indicate the view's OK event should run immediately instead of being shown to the user.
            var reminderDisabled = promptView.reminderDisabled();

            if (reminderDisabled) {
                promptView.onSubmit();
            } else {
                this.show(promptView);
            }
        },
        
        //  Whenever the YouTube API throws an error in the background, communicate
        //  that information to the user in the foreground via prompt.
        _showYouTubeErrorPrompt: function (youTubeError) {
            var text = chrome.i18n.getMessage('errorEncountered');

            switch (youTubeError) {
                case YouTubePlayerError.InvalidParameter:
                    text = chrome.i18n.getMessage('youTubePlayerErrorInvalidParameter');
                    break;
                case YouTubePlayerError.VideoNotFound:
                    text = chrome.i18n.getMessage('youTubePlayerErrorSongNotFound');
                    break;
                case YouTubePlayerError.NoPlayEmbedded:
                case YouTubePlayerError.NoPlayEmbedded2:
                    text = chrome.i18n.getMessage('youTubePlayerErrorNoPlayEmbedded');
                    break;
            }

            this._showPrompt(ErrorPromptView, {
                text: text,
                error: youTubeError
            });
        }
    });

    return PromptRegion;
});