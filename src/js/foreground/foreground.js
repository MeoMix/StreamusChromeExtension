//  When the foreground is loaded it will load all the ui elements. Grouped like this so I can wait for the
//  background YouTube player to load entirely before allowing foreground to open.
define([
    'foreground/view/genericForegroundView',
    'foreground/view/prompt/genericPromptView',
    'foreground/view/reloadView',
    'foreground/view/contextMenuView',
    'foreground/collection/contextMenuGroups'
], function (GenericForegroundView, GenericPromptView, ReloadView, ContextMenuView, ContextMenuGroups) {
    'use strict';
    //  TODO: Probably rename this file foregroundView and move into view folder.
    var ForegroundView = GenericForegroundView.extend({

        el: $('body'),
        
        contextMenuView: new ContextMenuView(),
        reloadPromptView: null,
        showReloadPromptTimeout: null,
               
        //  TODO: If I place these in initialize instead of here will they still sometimes be undefined?
        //  These are pulled from the background page. They'll be null until background is fully initialized.
        backgroundPlayer: chrome.extension.getBackgroundPage().YouTubePlayer,
        backgroundUser: chrome.extension.getBackgroundPage().User,

        initialize: function () {
  
            var self = this;
            
            this.$el.append(this.contextMenuView.render().el);
           
            //  If the foreground hasn't properly initialized after 5 seconds offer the ability to restart the program.
            //  Background.js might have gone awry for some reason and it is not always clear how to restart Streamus via chrome://extension
            this.showReloadPromptTimeout = setTimeout(function () {

                this.reloadPromptView = new GenericPromptView({
                    title: chrome.i18n.getMessage('reloadStreamus'),
                    okButtonText: chrome.i18n.getMessage('reload'),
                    showCancelButton: false,
                    model: new ReloadView()
                });

                this.reloadPromptView.fadeInAndShow();
            }.bind(this), 5000);

            //  TODO: Watch VideoSearchResults and Folders as well.
            //  If the user opens the foreground SUPER FAST after installing then requireJS won't have been able to load everything in the background in time.
            if (this.backgroundPlayer == null || this.backgroundUser == null) {

                //  Poll the background until it is ready.
                var checkBackgroundLoadedInterval = setInterval(function () {

                    self.backgroundPlayer = chrome.extension.getBackgroundPage().YouTubePlayer;
                    self.backgroundUser = chrome.extension.getBackgroundPage().User;

                    if (self.backgroundPlayer != null && self.backgroundUser != null) {

                        clearInterval(checkBackgroundLoadedInterval);
                        self.waitForBackgroundUserLoaded();
                    }

                }, 100);

            } else {
                this.waitForBackgroundUserLoaded();
            }

            //  If a click occurs and the default isn't prevented, reset the context menu groups to hide it.
            //  Child elements will call event.preventDefault() to indicate that they have handled the context menu.
            this.$el.on('click contextmenu', function (event) {

                var isDefaultPrevented = event.isDefaultPrevented();

                if (isDefaultPrevented) {

                    self.contextMenuView.show({
                        top: event.pageY,
                        //  Show the element just slightly offset as to not break onHover effects.
                        left: event.pageX + 1
                    });
                    
                } else {
                    //  Clearing the groups of the context menu will cause it to become hidden.
                    ContextMenuGroups.reset();
                }

            });

        },
        
        //  Having the current user's information loaded from the server is critical for foreground functionality.
        waitForBackgroundUserLoaded: function () {

            //  If the foreground is opened before the background has had a chance to load, wait for the background.
            //  This is easier than having every control on the foreground guard against the background not existing.
            if (this.backgroundUser.get('loaded')) {
                this.waitForBackgroundPlayerReady();
            } else {

                this.listenToOnce(this.backgroundUser, 'change:loaded', function (model, loaded) {

                    if (loaded) {
                        this.waitForBackgroundPlayerReady();
                    }

                });
            }

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
            }
        },
        
        //  Once the user's information has been retrieved and the YouTube player is loaded -- setup the rest of the foreground.
        loadBackgroundDependentContent: function () {
            this.$el.removeClass('loading');
            clearTimeout(this.showReloadPromptTimeout);
            
            if (this.reloadPromptView !== null) {
                this.reloadPromptView.remove();
            }
            
            require(['foreground/view/backgroundDependentForegroundView']);
        }
        
    });

    return new ForegroundView();
});