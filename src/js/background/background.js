//  Background.js is a bit of a dumping ground for code which needs a permanent housing spot.
define([
    'background/commands',
    'background/collection/searchResults',
    'background/collection/streamItems',
    'background/collection/playlists',
    'background/model/player',
    'background/model/settings',
    'background/model/user',
    'background/model/buttons/nextButton',
    'background/model/buttons/previousButton',
    'background/model/buttons/playPauseButton',
    'background/model/buttons/playPauseButton',
    'background/model/buttons/shuffleButton',
    'background/model/buttons/repeatButton',
    'background/model/buttons/radioButton',
    'background/model/contextMenus',
    'background/model/clientError',
    'background/model/iconManager',
    'background/model/omnibox',
    'background/model/user',
    'background/view/clipboardView'
], function (Commands, SearchResults, StreamItems, Playlists, Player, Settings, User, NextButton, PreviousButton, PlayPauseButton, ShuffleButton, RepeatButton, RadioButton) {
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
    
    //  I know this sucks. It's because of a 'bug' in chrome extensions where foreground can't reliably unsubscribe all of its events so the background has to be responsible for it. :(
    window.unbindViewEvents = function (foregroundLayout) {

        foregroundLayout.close();

        var collectionsToUnbind = [Playlists, SearchResults, StreamItems];
        var allToUnbind = [Player, User, Settings, NextButton, PlayPauseButton, PreviousButton, RadioButton, RepeatButton, ShuffleButton];

        _.each(collectionsToUnbind, function (collectionToUnbind) {
            allToUnbind.push(collectionToUnbind);

            collectionToUnbind.each(function (modelToUnbind) {
                allToUnbind.push(modelToUnbind);

                //  Be sure to add every PlaylistItem in every Playlist.
                if (modelToUnbind.has('items')) {
                    modelToUnbind.get('items').each(function (playlistItem) {
                        allToUnbind.push(playlistItem);
                    });
                }
            });
        });

        _.each(allToUnbind, function (toUnbind) {
            _.each(toUnbind._events, function (eventGroup, key) {
                var filteredEvents = _.filter(eventGroup, function (event) {
                    return !event.ctx.isClosed;
                });

                toUnbind._events[key] = filteredEvents;
            });
        });
    };

});