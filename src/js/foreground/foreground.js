//  When the foreground is loaded it will load all the ui elements. Grouped like this so I can wait for the
//  background YouTube player to load entirely before allowing foreground to open.
define([
    'foreground/model/foregroundViewManager',
    'foreground/view/prompt/reloadStreamusPromptView'
], function (ForegroundViewManager, ReloadStreamusPromptView) {
    'use strict';

    //  TODO: Turn this into an application.
    var ForegroundView = Backbone.Marionette.ItemView.extend({

        reloadPromptView: null,
        showReloadPromptTimeout: null,
               
        //  These are pulled from the background page. They'll be null until background is fully initialized.
        backgroundPlayer: chrome.extension.getBackgroundPage().YouTubePlayer,

        initialize: function () {

            //  If the user opens the foreground SUPER FAST after installing then requireJS won't have been able to load everything in the background in time.
            if (this.backgroundPlayer == null) {
                
                console.error("BACKGROUND PLAYER IS NULL NOOOO");

                //  Poll the background until it is ready.
                var checkBackgroundLoadedInterval = setInterval(function () {

                    this.backgroundPlayer = chrome.extension.getBackgroundPage().YouTubePlayer;

                    if (this.backgroundPlayer != null) {
                        clearInterval(checkBackgroundLoadedInterval);
                        this.waitForBackgroundPlayerReady();
                    }

                }.bind(this), 100);

            } else {
                this.waitForBackgroundPlayerReady();
            }
            
            ForegroundViewManager.subscribe(this);
        },
        
        //  If the foreground hasn't properly initialized after 5 seconds offer the ability to restart the program.
        //  Background.js might have gone awry for some reason and it is not always clear how to restart Streamus via chrome://extension
        startShowReloadPromptTimer: function () {
            this.showReloadPromptTimeout = setTimeout(function () {
                //  TODO: Use a region show to do this:
                this.reloadPromptView = new ReloadStreamusPromptView();
                this.reloadPromptView.fadeInAndShow();
            }.bind(this), 5000);
        },
        
        //  Having the YouTube player functional is critical for foreground functionality.
        waitForBackgroundPlayerReady: function () {
   
            if (this.backgroundPlayer.get('ready')) {
                //  Load foreground when the background indicates it has loaded.
                this.loadBackgroundDependentContent();
            } else {
                this.listenToOnce(this.backgroundPlayer, 'change:ready', function (model, ready) {
                    if (ready) {
                        this.loadBackgroundDependentContent();
                    }
                });
                
                //  If background player isn't ready yet -- wait 5 seconds before allowing restart of program.
                this.startShowReloadPromptTimer();
            }
        },
        
        //  Once the user's information has been retrieved and the YouTube player is loaded -- setup the rest of the foreground.
        loadBackgroundDependentContent: function () {
            clearTimeout(this.showReloadPromptTimeout);
            
            if (this.reloadPromptView !== null) {
                this.reloadPromptView.remove();
            }
            
            require(['foreground/view/backgroundDependentForegroundView']);
        }
        
    });

    return new ForegroundView();
});