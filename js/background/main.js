require.config({
    baseUrl: '../js/',
    shim: {
        lodash: {
            exports: '_'
        },
        backbone: {
            //  These script dependencies should be loaded before loading backbone.js
            deps: ['lodash', 'jquery'],
            //  Once loaded, use the global 'Backbone' as the module value.
            exports: 'Backbone'
        },
        googleApiClient: {
            exports: 'GoogleApiClient'
        },
        googleAnalytics: {
            deps: ['jquery']
        }
    },
    
    paths: {

        //  Global:
        'youTubeDataAPI': 'youTubeDataAPI',
        'utility': 'utility',

        //  Enum:
        'dataSource': 'enum/dataSource',
        'playerState': 'enum/playerState',
        'repeatButtonState': 'enum/repeatButtonState',
        'shareableEntityType': 'enum/shareableEntityType',

        //  Third Party:
        'backbone': 'thirdParty/backbone',
        'googleAnalytics': 'thirdParty/googleAnalytics',
        'jquery': 'thirdParty/jquery',
        'levenshtein': 'thirdParty/levenshtein',
        'lodash': 'thirdParty/lodash',
        'googleApiClient': 'thirdParty/googleApiClient',

        //  Background:
        'background': 'background/background',
        'commands': 'background/commands',

        //  Collection:
        'folders': 'background/collection/folders',
        'playlistItems': 'background/collection/playlistItems',
        'playlists': 'background/collection/playlists',
        'streamItems': 'background/collection/streamItems',
        'videoSearchResults': 'background/collection/videoSearchResults',

        //  Model:        
        'contextMenus': 'background/model/contextMenus',
        'error': 'background/model/error',
        'folder': 'background/model/folder',
        'iconManager': 'background/model/iconManager',
        'omnibox': 'background/model/omnibox',
        'player': 'background/model/player',
        'playlist': 'background/model/playlist',
        'playlistItem': 'background/model/playlistItem',
        'settings': 'background/model/settings',
        'shareCode': 'background/model/shareCode',
        'streamItem': 'background/model/streamItem',
        'user': 'background/model/user',
        'video': 'background/model/video',
        'videoSearchResult': 'background/model/videoSearchResult',
        'youTubePlayerAPI': 'background/model/youTubePlayerAPI',

        //  Model -> Buttons:
        'nextButton': 'background/model/buttons/nextButton',
        'playPauseButton': 'background/model/buttons/playPauseButton',
        'previousButton': 'background/model/buttons/previousButton',
        'radioButton': 'background/model/buttons/radioButton',
        'repeatButton': 'background/model/buttons/repeatButton',
        'shuffleButton': 'background/model/buttons/shuffleButton',
        'videoDisplayButton': 'background/model/buttons/videoDisplayButton'

    }
});

//  TODO: I am doing too much in main -- I want main.js to only define the shim and then load background.
require([
    'jquery',
    'lodash',
    'backbone',
    'googleApiClient',
    'googleAnalytics'
], function ($, _, Backbone, GoogleApiClient) {
    'use strict';

    //  TODO: This probably needs to support https and http.
    //  This URL is super important. Streamus uses it to bypass the YouTube error 'not allowed to play content in embedded player' by making itself look like YouTube!
    var refererUrl = 'http://www.youtube.com/embed/undefined?enablejsapi=1';

    //  Modify the iFrame headers to force HTML5 player and to look like we're actually a YouTube page.
    //  The HTML5 player seems more reliable (doesn't crash when Flash goes down) and looking like YouTube
    //  means we can bypass a lot of the embed restrictions.
    chrome.webRequest.onBeforeSendHeaders.addListener(function (info) {

        //  Bypass YouTube's embedded player content restrictions by looking like YouTube
        //  Any referer will do, maybe change to Streamus.com in the future? Or maybe leave as YouTube
        //  to stay under the radar. Not sure which is less suspicious.
        
        var refererRequestHeader = _.find(info.requestHeaders, function (requestHeader) {
            return requestHeader.name === 'Referer';
        });

        if (refererRequestHeader === undefined) {
            info.requestHeaders.push({
                name: 'Referer',
                value: refererUrl
            });
        } else {
            refererRequestHeader.value = refererUrl;
        }

        //  Make Streamus look like an iPhone to guarantee the html5 player shows up even if the video has an ad.
        var userAgentRequestHeader = _.find(info.requestHeaders, function (requestHeader) {
            return requestHeader.name === 'User-Agent';
        });

        var iPhoneUserAgent = 'Mozilla/5.0 (iPhone; U; CPU iPhone OS 4_3_2 like Mac OS X; en-us) AppleWebKit/533.17.9 (KHTML, like Gecko) Version/5.0.2 Mobile/8H7 Safari/6533.18.5';
        if (userAgentRequestHeader === undefined) {
            info.requestHeaders.push({
                name: 'User-Agent',
                value: iPhoneUserAgent
            });
        } else {
            userAgentRequestHeader.value = iPhoneUserAgent;
        }

        return { requestHeaders: info.requestHeaders };
    }, {
        urls: [refererUrl]
    },
        ['blocking', 'requestHeaders']
    );
    
    //  Build iframe after onBeforeSendHeaders listener to prevent errors and generate correct type of player.
    $('<iframe>', {
        id: 'MusicHolder',
        //  Width and Height should have a ratio of 4 to 3
        width: 480,
        height: 360,
        src: refererUrl
    }).appendTo('body');
    
    //  Only use main.js for loading external helper files before the background is ready. Then, load the background.
    require(['background']);
});