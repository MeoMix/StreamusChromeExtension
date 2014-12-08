define([
    'common/enum/youTubePlayerError',
    'foreground/view/prompt/errorPromptView',
    'foreground/view/prompt/googleSignInPromptView',
    'foreground/view/prompt/linkUserIdPromptView',
    'foreground/view/prompt/updateStreamusPromptView'
], function (YouTubePlayerError, ErrorPromptView, GoogleSignInPromptView, LinkUserIdPromptView, UpdateStreamusPromptView) {
    'use strict';

    var PromptRegion = Marionette.Region.extend({
        player: null,
        signInManager: null,
        
        initialize: function () {
            this.player = Streamus.backgroundPage.player;
            this.signInManager = Streamus.backgroundPage.signInManager;

            this.listenTo(Streamus.channels.prompt.commands, 'show:prompt', this._showPrompt);
            this.listenTo(Streamus.channels.foregroundArea.vent, 'shown', this._onForegroundAreaShown);
            this.listenTo(this.player, 'youTubeError', this._onPlayerYouTubeError);
            this.listenTo(this.signInManager, 'change:needLinkUserId', this._onSignInManagerChangeNeedLinkUserId);
            this.listenTo(this.signInManager, 'change:needGoogleSignIn', this._onSignInManagerChangeNeedGoogleSignIn);
            chrome.runtime.onUpdateAvailable.addListener(this._onChromeRuntimeUpdateAvailable.bind(this));
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
            //  TODO: The callback will be optional once Google resolves https://code.google.com/p/chromium/issues/detail?id=417564
            chrome.runtime.requestUpdateCheck(_.noop);
        },
        
        //  If SignInManager indicates that sign-in state has changed and necessitates asking the user to link their account to Google, do so.
        //  This might happen while the foreground UI isn't open (most likely, in fact), so need to check state upon foreground UI opening.
        _promptIfNeedLinkUserId: function() {
            if (this.signInManager.get('needLinkUserId')) {
                this._showLinkUserIdPrompt();
            }
        },
        
        _promptIfNeedGoogleSignIn: function() {
            if (this.signInManager.get('needGoogleSignIn')) {
                this._showGoogleSignInPrompt();
            }
        },
        
        _onChromeRuntimeUpdateAvailable: function () {
            this._showUpdateStreamusPrompt();
        },
        
        _onSignInManagerChangeNeedLinkUserId: function (model, needLinkUserId) {
            if (needLinkUserId) {
                this._showLinkUserIdPrompt();
            }
        },
        
        _onSignInManagerChangeNeedGoogleSignIn: function (model, needGoogleSignIn) {
            if (needGoogleSignIn) {
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

            //  Sometimes checkbox reminders are in place which would indicate the view's onSubmit event should run immediately.
            var reminderEnabled = promptView.isReminderEnabled();

            if (reminderEnabled) {
                this.show(promptView);
            } else {
                promptView.onSubmit();
            }
        },
        
        _onPlayerYouTubeError: function (model, youTubeError) {
            this._showYouTubeErrorPrompt(youTubeError);
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