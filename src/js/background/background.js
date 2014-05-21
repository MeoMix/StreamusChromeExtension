//  Background.js is a bit of a dumping ground for code which needs a permanent housing spot.
define([
    'background/commands',
    'background/collection/searchResults',
    'background/model/settings',
    'background/model/contextMenus',
    'background/model/clientError',
    'background/model/iconManager',
    'background/model/omnibox',
    'background/model/user',
    'background/view/clipboardView'
], function (Commands, SearchResults, Settings) {
    'use strict';
   
    window.clearResultsTimeout = null;
    var tenSeconds = 10000;
    
    //  The foreground has to be able to call this whenever a view opens.
    window.stopClearResultsTimer = function () {
        clearTimeout(window.clearResultsTimeout);
    };

    //  It's important to write this to the background page because the foreground gets destroyed so it couldn't possibly remember it.
    window.startClearResultsTimer = function () {
        //  Safe-guard against multiple setTimeouts, just incase.
        window.stopClearResultsTimer();

        window.clearResultsTimeout = setTimeout(function () {
            Settings.set('searchQuery', '');
            SearchResults.reset();
        }, tenSeconds);
    };
});