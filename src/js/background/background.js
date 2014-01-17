//  Background.js is a bit of a dumping ground for code which needs a permanent housing spot.
define([
    'background/commands',
    'background/collection/folders',
    'background/collection/videoSearchResults',
    'background/model/player',
    'background/model/contextMenus',
    'background/model/error',
    'background/model/iconManager',
    'background/model/omnibox',
    'background/model/user',
    'background/view/clipboardView'
], function () {
    'use strict';

    window.onmessage = function(messageEvent) {

        if (messageEvent.origin === 'https://www.youtube.com') {
            console.log("messageEvent:", messageEvent);
            
            if (messageEvent.ports.length > 0 && messageEvent.data === 'connect') {
                var port = messageEvent.ports[0];
                
                port.onmessage = function (message) {
                    console.log("background message:", message);
                };
            }

        }
    };
});