//  The foreground can be destroyed, but with a log message still attempting to execute. This wrapper ensures logging doesn't throw errors.
console = window && console;

require.config({
    shim: {
        underscore: {
            exports: '_'
        },
        backbone: {
            //  These script dependencies should be loaded before loading backbone.js
            deps: ['underscore', 'jquery'],
            //  Once loaded, use the global 'Backbone' as the module value.
            exports: 'Backbone'
        },
        //  For "modules" that are just jQuery or Backbone plugins that do not need to export any module value, the shim config can just be an array of dependencies:
        lazyload: ['jquery'],
        jqueryUi: ['jquery'],
        scrollIntoView: ['jquery']
    }
});

require([
    'jquery',
    'underscore',
    'backbone',
    'lazyload',
    'jqueryUi',
    'scrollIntoView'
], function ($, _, Backbone) {
    'use strict';
    
    //  TODO: This sucks.
    require(['loadingSpinnerView', 'reloadPromptView'], function(LoadingSpinnerView, ReloadPromptView) {

        var loadingSpinnerView = new LoadingSpinnerView;
        $('body').append(loadingSpinnerView.render().el);

        var reloadPromptView = new ReloadPromptView;
        var showReloadPromptTimeout = setTimeout(function() {
            $('body').append(reloadPromptView.render().el);

        }, 5000);

        //  If the user opens the foreground SUPER FAST then requireJS won't have been able to load everything in the background in time.
        var player = chrome.extension.getBackgroundPage().YouTubePlayer;
        var user = chrome.extension.getBackgroundPage().User;

        if (player == null || user == null) {

            var checkBackgroundLoadedInterval = setInterval(function () {

                console.log("checkBackgroundLoadedInterval");

                player = chrome.extension.getBackgroundPage().YouTubePlayer;
                user = chrome.extension.getBackgroundPage().User;

                if (player != null && user != null) {

                    clearInterval(checkBackgroundLoadedInterval);
                    waitForUserLoaded();
                }

            }, 100);

        } else {
            waitForUserLoaded();
        }

        function waitForUserLoaded() {

            //  If the foreground is opened before the background has had a chance to load, wait for the background.
            //  This is easier than having every control on the foreground guard against the background not existing.
            if (user.get('loaded')) {
                waitForPlayerReady();
            } else {
                user.once('change:loaded', waitForPlayerReady);
            }

        }

        function waitForPlayerReady() {

            if (player.get('ready')) {
                //  Load foreground when the background indicates it has loaded.
                loadForeground();
            } else {
                player.once('change:ready', loadForeground);
            }

        }

        function loadForeground() {

            $('body').removeClass('backgroundUnloaded');
            clearTimeout(showReloadPromptTimeout);
            reloadPromptView.remove();

            loadingSpinnerView.remove();
            require(['foreground']);

        }
    });
});