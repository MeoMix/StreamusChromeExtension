require.config({
    
    baseUrl: '../js/',
    
    shim: {

        'backbone': {
            //  These script dependencies should be loaded before loading backbone.js
            deps: ['lodash', 'jquery'],
            //  Once loaded, use the global 'Backbone' as the module value.
            exports: 'Backbone'
        },
        
        'googleAnalytics': {
            deps: ['jquery']
        }
        
    },
    
    paths: {

        //  Global:
        'dataSource': 'dataSource',
        'googleAPI': 'googleAPI',
        'utility': 'utility',
        'youTubeV2API': 'youTubeV2API',
        'youTubeV3API': 'youTubeV3API',

        //  Enum:
        'dataSourceType': 'enum/dataSourceType',
        'playerState': 'enum/playerState',
        'repeatButtonState': 'enum/repeatButtonState',
        'shareableEntityType': 'enum/shareableEntityType',
        'youTubePlayerError': 'enum/youTubePlayerError',

        //  Third Party:
        'async': 'thirdParty/async',
        'backbone': 'thirdParty/backbone',
        'googleAnalytics': 'thirdParty/googleAnalytics',
        'jquery': 'thirdParty/jquery',
        'lodash': 'thirdParty/lodash',

        //  Background:
        'background': 'background/background',
        'commands': 'background/commands',
        'notifications': 'background/notifications',

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

require([
    'jquery',
    'lodash',
    'backbone',
    'googleAPI',
    'googleAnalytics'
], function () {
    'use strict';

    //  Only use main.js for loading external helper files before the background is ready. Then, load the background.
    require(['background']);
});