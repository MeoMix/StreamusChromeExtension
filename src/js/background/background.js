//  Background.js is a bit of a dumping ground for code which needs a permanent housing spot.
define([
    'background/commands',
    'background/model/settings',
    'background/collection/videoSearchResults',
    'background/model/player',
    'background/model/contextMenus',
    'background/model/error',
    'background/model/iconManager',
    'background/model/omnibox',
    'background/model/user',
    'background/view/clipboardView'
], function (Commands, Settings, VideoSearchResults) {
    'use strict';
   
    window.clearResultsTimeout = null;
    var twentySeconds = 20000;
    //  It's important to write this to the background page because the foreground gets destroyed so it couldn't possibly remember it.
    window.startClearResultsTimer = function () {
        //  Safe-guard against multiple setTimeouts, just incase.
        stopClearResultsTimer();

        window.clearResultsTimeout = setTimeout(function () {
            Settings.set('searchQuery', '');
            VideoSearchResults.clear();
        }, twentySeconds);

        console.log("startClearResultsTimer has started");
    };

    //  The foreground has to be able to call this whenever a view opens.
    window.stopClearResultsTimer = function() {
        clearTimeout(window.clearResultsTimeout);
    };
   
});