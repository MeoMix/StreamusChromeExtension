define([
    'common/enum/youTubePlayerError',
    'foreground/view/prompt/noPlayEmbeddedPromptView',
    'foreground/view/prompt/notificationPromptView',
    'foreground/view/prompt/reloadStreamusPromptView',
    'foreground/view/prompt/updateStreamusPromptView'
], function (YouTubePlayerError, NoPlayEmbeddedPromptView, NotificationPromptView, ReloadStreamusPromptView, UpdateStreamusPromptView) {
    'use strict';
    
    var Player = chrome.extension.getBackgroundPage().YouTubePlayer;

    var PromptRegion = Backbone.Marionette.Region.extend({
        el: '#prompt-region',
        showReloadPromptTimeout: null,
        
        initialize: function() {
            this.listenTo(window.Application.vent, 'showPrompt', this._showPrompt);
            this.listenTo(Player, 'error', this._showYouTubeErrorPrompt);
        },
        
        //  Make sure Streamus stays up to date because if my Server de-syncs people won't be able to save properly.
        //  http://developer.chrome.com/extensions/runtime#method-requestUpdateCheck
        promptIfUpdateAvailable: function () {
            chrome.runtime.onUpdateAvailable.addListener(this._showUpdateStreamusPrompt.bind(this));
            //  Don't need to handle the update check -- just need to call it so that onUpdateAvailable will fire.
            chrome.runtime.requestUpdateCheck(function () { });
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
        
        //  Display a prompt to the user indicating that they should restart Streamus because an update has been downloaded.
        _showUpdateStreamusPrompt: function () {
            this._showPrompt(UpdateStreamusPromptView);
        },
        
        _showReloadStreamusPrompt: function() {
            this._showPrompt(ReloadStreamusPromptView);
        },
        
        _showPrompt: function (PromptView, options) {
            var promptView = new PromptView(_.extend({
                containerHeight: this.$el.height()
            }, options));

            //  Sometimes checkbox reminders are in place which would indicate the view's OK event should run immediately instead of being shown to the user.
            var reminderDisabled = promptView.reminderDisabled();
            
            if (reminderDisabled) {
                promptView.model.get('view').doOk();
            } else {
                this.listenToOnce(promptView, 'hidden', this.empty);
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

                this._showPrompt(NotificationPromptView, {
                    text: text
                });
            }
        }
    });

    return PromptRegion;
});