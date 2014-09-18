define([
    'common/enum/youTubePlayerError',
    'foreground/view/prompt/errorPromptView',
    'foreground/view/prompt/googleSignInPromptView',
    'foreground/view/prompt/linkUserIdPromptView',
    'foreground/view/prompt/noPlayEmbeddedPromptView',
    'foreground/view/prompt/reloadStreamusPromptView',
    'foreground/view/prompt/updateStreamusPromptView'
], function (YouTubePlayerError, ErrorPromptView, GoogleSignInPromptView, LinkUserIdPromptView, NoPlayEmbeddedPromptView, ReloadStreamusPromptView, UpdateStreamusPromptView) {
    'use strict';
    
    var Player = Streamus.backgroundPage.YouTubePlayer;
    var SignInManager = Streamus.backgroundPage.SignInManager;

    var PromptRegion = Backbone.Marionette.Region.extend({
        el: '.region-prompt',
        showReloadPromptTimeout: null,
        
        initialize: function () {
            this.listenTo(Backbone.Wreqr.radio.channel('prompt').vent, 'show', this._showPrompt);
            this.listenTo(Player, 'error', this._showYouTubeErrorPrompt);
            this.listenTo(SignInManager, 'change:needPromptLinkUserId', this._onChangeNeedPromptLinkUserId);
            this.listenTo(SignInManager, 'change:needPromptGoogleSignIn', this._onChangeNeedPromptGoogleSignIn);
        },
        
        //  Make sure Streamus stays up to date because if my Server de-syncs people won't be able to save properly.
        //  http://developer.chrome.com/extensions/runtime#method-requestUpdateCheck
        promptIfUpdateAvailable: function () {
            chrome.runtime.onUpdateAvailable.addListener(this._showUpdateStreamusPrompt.bind(this));
            //  Don't need to handle the update check -- just need to call it so that onUpdateAvailable will fire.
            chrome.runtime.requestUpdateCheck(function () { });
        },
        
        //  If SignInManager indicates that sign-in state has changed and necessitates asking the user to link their account to Google, do so.
        //  This might happen while the foreground UI isn't open (most likely, in fact), so need to check state upon foreground UI opening.
        promptIfNeedLinkUserId: function() {
            if (SignInManager.get('needPromptLinkUserId')) {
                this._showLinkUserIdPrompt();
            }
        },
        
        promptIfNeedGoogleSignIn: function() {
            if (SignInManager.get('needPromptGoogleSignIn')) {
                this._showGoogleSignInPrompt();
            }
        },
        
        //  If the foreground hasn't properly initialized after 5 seconds offer the ability to restart the program.
        //  Background.js might have gone awry for some reason and it is not always clear how to restart Streamus via chrome://extension
        startShowReloadPromptTimer: function () {
            this.showReloadPromptTimeout = setTimeout(this._showReloadStreamusPrompt.bind(this), 5000);
        },

        hideReloadStreamusPrompt: function () {
            clearTimeout(this.showReloadPromptTimeout);

            if (this.currentView instanceof ReloadStreamusPromptView) {
                this.currentView.hide();
            }
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
        
        _showReloadStreamusPrompt: function() {
            this._showPrompt(ReloadStreamusPromptView);
        },
        
        _showPrompt: function (PromptView, options) {
            var promptView = new PromptView(options);

            //  Sometimes checkbox reminders are in place which would indicate the view's OK event should run immediately instead of being shown to the user.
            var reminderDisabled = promptView.reminderDisabled();

            console.log('reminderDisabled:', reminderDisabled);
            
            if (reminderDisabled) {
                var subView = promptView.model.get('view');
                var doOkFunction = subView.doOk;
                
                if (_.isFunction(doOkFunction)) {
                    doOkFunction.call(subView);
                }
            } else {
                this.show(promptView);
            }
        },
        
        //  Whenever the YouTube API throws an error in the background, communicate
        //  that information to the user in the foreground via prompt.
        _showYouTubeErrorPrompt: function (youTubeError) {
            if (youTubeError === YouTubePlayerError.NoPlayEmbedded || youTubeError === YouTubePlayerError.NoPlayEmbedded2) {
                this._showPrompt(NoPlayEmbeddedPromptView);
            } else {
                var text = chrome.i18n.getMessage('errorEncountered');

                switch (youTubeError) {
                    case YouTubePlayerError.InvalidParameter:
                        text = chrome.i18n.getMessage('youTubePlayerErrorInvalidParameter');
                        break;
                    case YouTubePlayerError.VideoNotFound:
                        text = chrome.i18n.getMessage('youTubePlayerErrorSongNotFound');
                        break;
                }

                this._showPrompt(ErrorPromptView, {
                    text: text
                });
            }
        }
    });

    return PromptRegion;
});