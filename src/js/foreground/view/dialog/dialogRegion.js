define(function(require) {
  'use strict';

  var YouTubePlayerError = require('common/enum/youTubePlayerError');
  var ErrorDialogView = require('foreground/view/dialog/errorDialogView');
  var GoogleSignInDialogView = require('foreground/view/dialog/googleSignInDialogView');
  var LinkUserIdDialogView = require('foreground/view/dialog/linkUserIdDialogView');
  var UpdateStreamusDialogView = require('foreground/view/dialog/updateStreamusDialogView');

  var DialogRegion = Marionette.Region.extend({
    player: null,
    signInManager: null,

    initialize: function(options) {
      this.player = options.player;
      this.signInManager = options.signInManager;

      this.listenTo(StreamusFG.channels.dialog.commands, 'show:dialog', this._showDialog);
      this.listenTo(StreamusFG.channels.foregroundArea.vent, 'idle', this._onForegroundAreaIdle);
      this.listenTo(this.player, 'youTubeError', this._onPlayerYouTubeError);
      this.listenTo(this.signInManager, 'change:needLinkUserId', this._onSignInManagerChangeNeedLinkUserId);
      this.listenTo(this.signInManager, 'change:needGoogleSignIn', this._onSignInManagerChangeNeedGoogleSignIn);
      chrome.runtime.onUpdateAvailable.addListener(this._onChromeRuntimeUpdateAvailable.bind(this));
    },

    _onForegroundAreaIdle: function() {
      this._showDialogIfNeedGoogleSignIn();
      this._showDialogIfNeedLinkUserId();
      this._showDialogIfUpdateAvailable();
    },

    // Make sure Streamus stays up to date because if my Server de-syncs people won't be able to save properly.
    // http://developer.chrome.com/extensions/runtime#method-requestUpdateCheck
    _showDialogIfUpdateAvailable: function() {
      // Calling requestUpdateCheck will cause onUpdateAvailable to trigger if an update is available.
      chrome.runtime.requestUpdateCheck(_.noop);
    },

    // If needed, show a dialog prompting the user to link their G+ account ID to their Streamus user.
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

    // Notify user that they should restart Streamus because an update has been downloaded.
    _onChromeRuntimeUpdateAvailable: function() {
      this._showDialog(UpdateStreamusDialogView);
    },

    _onSignInManagerChangeNeedLinkUserId: function(model, needLinkUserId) {
      if (needLinkUserId) {
        this._showLinkUserIdDialog();
      }
    },

    _onSignInManagerChangeNeedGoogleSignIn: function(model, needGoogleSignIn) {
      if (needGoogleSignIn) {
        this._showGoogleSignInDialog();
      }
    },

    // Ask the user to confirm linking their Google+ ID to the currently signed in Chrome account.
    _showLinkUserIdDialog: function() {
      this._showDialog(LinkUserIdDialogView, {
        signInManager: StreamusFG.backgroundProperties.signInManager
      });
    },

    _showGoogleSignInDialog: function() {
      this._showDialog(GoogleSignInDialogView, {
        signInManager: StreamusFG.backgroundProperties.signInManager
      });
    },

    _showDialog: function(DialogView, options) {
      var dialogView = new DialogView(options);

      // Sometimes checkbox reminders are in place which would indicate the view's onSubmit event should run immediately.
      var reminderEnabled = dialogView.isReminderEnabled();

      if (reminderEnabled) {
        this.show(dialogView);
      } else {
        dialogView.onSubmit();
      }
    },

    _onPlayerYouTubeError: function(model, youTubeError) {
      this._showYouTubeErrorDialog(youTubeError);
    },

    // Notify user that YouTube's API has emitted an error
    _showYouTubeErrorDialog: function(youTubeError) {
      var text = chrome.i18n.getMessage('errorEncountered');

      switch (youTubeError) {
        case YouTubePlayerError.VideoNotFound:
          text = chrome.i18n.getMessage('youTubePlayerErrorVideoNotFound');
          break;
        case YouTubePlayerError.InvalidParameter:
        case YouTubePlayerError.NoPlayEmbedded:
        case YouTubePlayerError.NoPlayEmbedded2:
          text = chrome.i18n.getMessage('youTubePlayerErrorNoPlayEmbedded');
          break;
      }

      this._showDialog(ErrorDialogView, {
        player: StreamusFG.backgroundProperties.player,
        text: text,
        error: youTubeError
      });
    }
  });

  return DialogRegion;
});