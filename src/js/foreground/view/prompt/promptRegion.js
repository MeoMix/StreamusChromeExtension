define([
    'common/enum/youTubePlayerError',
    'foreground/view/prompt/noPlayEmbeddedPromptView',
    'foreground/view/prompt/notificationPromptView',
    'foreground/view/prompt/reloadStreamusPromptView',
    'foreground/view/prompt/updateStreamusPromptView'
], function (YouTubePlayerError, NoPlayEmbeddedPromptView, NotificationPromptView, ReloadStreamusPromptView, UpdateStreamusPromptView) {
    'use strict';
    
    var Player = chrome.extension.getBackgroundPage().YouTubePlayer;

    //  TODO: Make some methods private w/ _
    var PromptRegion = Backbone.Marionette.Region.extend({
        el: '#prompt-region',

        showReloadPromptTimeout: null,
        
        initialize: function() {
            this.listenTo(window.Application.vent, 'showPrompt', this.showPrompt);
            this.listenTo(Player, 'error', this.showYouTubeErrorPrompt);
        },
        
        //  Make sure Streamus stays up to date because if my Server de-syncs people won't be able to save properly.
        //  http://developer.chrome.com/extensions/runtime#method-requestUpdateCheck
        promptIfUpdateAvailable: function () {
            chrome.runtime.onUpdateAvailable.addListener(this.showUpdateStreamusPrompt.bind(this));
            //  Don't need to handle the update check -- just need to call it so that onUpdateAvailable will fire.
            chrome.runtime.requestUpdateCheck(function () { });
        },
        
        //  Display a prompt to the user indicating that they should restart Streamus because an update has been downloaded.
        showUpdateStreamusPrompt: function () {
            this.showPrompt(new UpdateStreamusPromptView());
        },
        
        showReloadStreamusPrompt: function() {
            this.showPrompt(new ReloadStreamusPromptView());
        },
        
        showPrompt: function (view) {
            this.listenToOnce(view, 'hide', this.empty);
            this.show(view);
        },

        //  If the foreground hasn't properly initialized after 5 seconds offer the ability to restart the program.
        //  Background.js might have gone awry for some reason and it is not always clear how to restart Streamus via chrome://extension
        startShowReloadPromptTimer: function () {
            this.showReloadPromptTimeout = setTimeout(this.showReloadStreamusPrompt.bind(this), 5000);
        },
        
        hideReloadStreamusPrompt: function () {
            clearTimeout(this.showReloadPromptTimeout);

            //  Ensure that the PromptRegion is currently displaying the ReloadStreamusPrompt. If so, hide it!
            if (this.promptRegion.currentView instanceof ReloadStreamusPromptView) {
                this.promptRegion.empty();
            }
        },
        
        //  Whenever the YouTube API throws an error in the background, communicate
        //  that information to the user in the foreground via prompt.
        showYouTubeErrorPrompt: function (youTubeError) {
            if (youTubeError === YouTubePlayerError.NoPlayEmbedded || youTubeError === YouTubePlayerError.NoPlayEmbedded2) {
                this.showPrompt(new NoPlayEmbeddedPromptView());
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

                this.showPrompt(new NotificationPromptView({
                    text: text
                }));
            }
        }
    });

    return PromptRegion;
});