//  When the foreground is loaded it will load all the ui elements. Grouped like this so I can wait for the
//  background YouTube player to load entirely before allowing foreground to open.
define([
    'foreground/model/foregroundViewManager',
    'foreground/view/prompt/genericPromptView',
    'foreground/view/reloadView',
    'foreground/view/contextMenuView',
    'foreground/collection/contextMenuGroups'
], function (ForegroundViewManager, GenericPromptView, ReloadView, ContextMenuView, ContextMenuGroups) {
    'use strict';

    var ForegroundView = Backbone.Marionette.ItemView.extend({

        el: $('body'),
        
        contextMenuView: new ContextMenuView({
            collection: ContextMenuGroups
        }),
        reloadPromptView: null,
        showReloadPromptTimeout: null,
        
        events: {
            'contextmenu': 'tryResetContextMenu',
            'click': 'tryResetContextMenu'
        },
               
        //  These are pulled from the background page. They'll be null until background is fully initialized.
        backgroundPlayer: chrome.extension.getBackgroundPage().YouTubePlayer,

        initialize: function () {

            ForegroundViewManager.subscribe(this);
            this.$el.append(this.contextMenuView.render().el);

            //  TODO: Watch VideoSearchResults and Playlists as well.
            //  If the user opens the foreground SUPER FAST after installing then requireJS won't have been able to load everything in the background in time.
            if (this.backgroundPlayer == null) {

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

        },
        
        //  If the foreground hasn't properly initialized after 5 seconds offer the ability to restart the program.
        //  Background.js might have gone awry for some reason and it is not always clear how to restart Streamus via chrome://extension
        startShowReloadPromptTimer: function () {
            this.showReloadPromptTimeout = setTimeout(function () {
                
                this.reloadPromptView = new GenericPromptView({
                    title: chrome.i18n.getMessage('reloadStreamus'),
                    okButtonText: chrome.i18n.getMessage('reload'),
                    showCancelButton: false,
                    model: new ReloadView()
                });

                this.reloadPromptView.fadeInAndShow();
            }.bind(this), 5000);
        },
        
        //  If a click occurs and the default isn't prevented, reset the context menu groups to hide it.
        //  Child elements will call event.preventDefault() to indicate that they have handled the context menu.
        tryResetContextMenu: function (event) {

            if (event.isDefaultPrevented()) {

                this.contextMenuView.show({
                    top: event.pageY,
                    //  Show the element just slightly offset as to not break onHover effects.
                    left: event.pageX + 1
                });

            } else {
                //  Clearing the groups of the context menu will cause it to become hidden.
                ContextMenuGroups.reset();
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
                
                //  If background player isn't ready yet -- wait 5 seconds before allowing restart of program.
                this.startShowReloadPromptTimer();
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