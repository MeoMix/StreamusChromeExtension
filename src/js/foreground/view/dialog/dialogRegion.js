﻿define(function (require) {
    'use strict';

    var YouTubePlayerError = require('common/enum/youTubePlayerError');
    var ErrorDialogView = require('foreground/view/dialog/errorDialogView');
    var FlashLoadedDialogView = require('foreground/view/dialog/flashLoadedDialogView');
    var GoogleSignInDialogView = require('foreground/view/dialog/googleSignInDialogView');
    var LinkUserIdDialogView = require('foreground/view/dialog/linkUserIdDialogView');
    var UpdateStreamusDialogView = require('foreground/view/dialog/updateStreamusDialogView');

    var DialogRegion = Marionette.Region.extend({
        player: null,
        signInManager: null,
        debugManager: null,
        
        initialize: function () {
            this.player = Streamus.backgroundPage.player;
            this.signInManager = Streamus.backgroundPage.signInManager;
            this.debugManager = Streamus.backgroundPage.debugManager;

            this.listenTo(Streamus.channels.dialog.commands, 'show:dialog', this._showDialog);
            this.listenTo(Streamus.channels.foregroundArea.vent, 'rendered', this._onForegroundAreaRendered);
            this.listenTo(this.player, 'youTubeError', this._onPlayerYouTubeError);
            this.listenTo(this.signInManager, 'change:needLinkUserId', this._onSignInManagerChangeNeedLinkUserId);
            this.listenTo(this.signInManager, 'change:needGoogleSignIn', this._onSignInManagerChangeNeedGoogleSignIn);
            chrome.runtime.onUpdateAvailable.addListener(this._onChromeRuntimeUpdateAvailable.bind(this));
        },
        
        _onForegroundAreaRendered: function () {
            this._showDialogIfNeedGoogleSignIn();
            this._showDialogIfNeedLinkUserId();
            this._showDialogIfUpdateAvailable();
            this._showDialogIfFlashLoaded();
        },

        //  Make sure Streamus stays up to date because if my Server de-syncs people won't be able to save properly.
        //  http://developer.chrome.com/extensions/runtime#method-requestUpdateCheck
        _showDialogIfUpdateAvailable: function () {
            //  Don't need to handle the update check -- just need to call it so that onUpdateAvailable will fire.
            //  TODO: The callback will be optional once Google resolves https://code.google.com/p/chromium/issues/detail?id=417564
            chrome.runtime.requestUpdateCheck(_.noop);
        },
        
        //  If SignInManager indicates that sign-in state has changed and necessitates asking the user to link their account to Google, do so.
        //  This might happen while the foreground UI isn't open (most likely, in fact), so need to check state upon foreground UI opening.
        _showDialogIfNeedLinkUserId: function() {
            if (this.signInManager.get('needLinkUserId')) {
                this._showLinkUserIdDialog();
            }
        },
        
        _showDialogIfNeedGoogleSignIn: function() {
            if (this.signInManager.get('needGoogleSignIn')) {
                this._showGoogleSignInDialog();
            }
        },
        
        _showDialogIfFlashLoaded: function () {
            if (this.debugManager.get('flashLoaded')) {
                this._showDialog(FlashLoadedDialogView);
            }
        },
        
        //  Notify user that they should restart Streamus because an update has been downloaded.
        _onChromeRuntimeUpdateAvailable: function () {
            this._showDialog(UpdateStreamusDialogView);
        },
        
        _onSignInManagerChangeNeedLinkUserId: function (model, needLinkUserId) {
            if (needLinkUserId) {
                this._showLinkUserIdDialog();
            }
        },
        
        _onSignInManagerChangeNeedGoogleSignIn: function (model, needGoogleSignIn) {
            if (needGoogleSignIn) {
                this._showGoogleSignInDialog();
            }
        },
        
        //  Ask the user to confirm linking their Google+ ID to the currently signed in Chrome account.
        _showLinkUserIdDialog: function () {
            this._showDialog(LinkUserIdDialogView);
        },
        
        _showGoogleSignInDialog: function () {
            this._showDialog(GoogleSignInDialogView);
        },
        
        _showDialog: function (DialogView, options) {
            var dialogView = new DialogView(options);

            //  Sometimes checkbox reminders are in place which would indicate the view's onSubmit event should run immediately.
            var reminderEnabled = dialogView.isReminderEnabled();

            if (reminderEnabled) {
                this.show(dialogView);
            } else {
                dialogView.onSubmit();
            }
        },
        
        _onPlayerYouTubeError: function (model, youTubeError) {
            this._showYouTubeErrorDialog(youTubeError);
        },
        
        //  Notify user that YouTube's API has emitted an error
        _showYouTubeErrorDialog: function (youTubeError) {
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

            this._showDialog(ErrorDialogView, {
                text: text,
                error: youTubeError
            });
        }
    });

    return DialogRegion;
});