//  The foreground can be destroyed, but with a log message still attempting to execute. This wrapper ensures logging doesn't throw errors.
console = window && console;

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
        googleAnalytics: {
            deps: ['jquery']
        },
        //  For "modules" that are just jQuery or Backbone plugins that do not need to export any module value, the shim config can just be an array of dependencies:
        lazyload: ['jquery'],
        transit: ['jquery'],
        autoscroll: ['jquery'],
        hoverIntent: ['jquery'],
        jqueryUi: ['jquery'],
        scrollIntoView: ['jquery']
        
    },
    
    //  It's easier to define all the paths once rather than bloat each file with long paths during the require (keeps things DRY)
    paths: {
        
        //  Global:
        'youTubeDataAPI': 'youTubeDataAPI',
        'utility': 'utility',

        //  Enum:
        'addSearchResultOptionType': 'enum/addSearchResultOptionType',
        'dataSource': 'enum/dataSource',
        'playerState': 'enum/playerState',
        'repeatButtonState': 'enum/repeatButtonState',

        //  Third Party:
        'backbone': 'thirdParty/backbone',
        'autoscroll': 'thirdParty/jquery.autoscroll',
        'hoverIntent': 'thirdParty/jquery.hoverIntent',
        'jquery': 'thirdParty/jquery',
        'jqueryUi': 'thirdParty/jqueryUi',
        'lazyload': 'thirdParty/jquery.lazyload',
        'transit': 'thirdParty/jquery.transit',
        'levenshtein': 'thirdParty/levenshtein',
        'scrollIntoView': 'thirdParty/jquery.scrollIntoView',
        'lodash': 'thirdParty/lodash',
        'microplugin': 'thirdParty/microplugin',
        'selectize': 'thirdParty/selectize',
        'sifter': 'thirdParty/sifter',
        'text': 'thirdParty/text',

        //  Foreground:
        'foreground': 'foreground/foreground',

        //  Collection:
        'contextMenuGroups': 'foreground/collection/contextMenuGroups',
        'contextMenuItems': 'foreground/collection/contextMenuItems',
        'folders': 'foreground/collection/folders',
        'streamItems': 'foreground/collection/streamItems',
        'videoSearchResults': 'foreground/collection/videoSearchResults',

        //  Model:
        'activeFolderArea': 'foreground/model/activeFolderArea',
        'activePlaylistArea': 'foreground/model/activePlaylistArea',
        'addSearchResultOption': 'foreground/model/addSearchResultOption',
        'addSearchResults': 'foreground/model/addSearchResults',
        'contextMenuGroup': 'foreground/model/contextMenuGroup',
        'contextMenuItem': 'foreground/model/contextMenuItem',
        'dialog': 'foreground/model/dialog',
        'player': 'foreground/model/player',
        'reloadPrompt': 'foreground/model/reloadPrompt',
        'playlistAction': 'foreground/model/playlistAction',
        'settings': 'foreground/model/settings',
        'streamAction': 'foreground/model/streamAction',
        'videoSearch': 'foreground/model/videoSearch',
        'videoSearchResult': 'foreground/model/videoSearchResult',
        'videoSearchResultAction': 'foreground/model/videoSearchResultAction',

        //  Model -> Buttons:
        'playPauseButton': 'foreground/model/buttons/playPauseButton',

        //  View:
        'clearStreamView': 'foreground/view/clearStreamView',
        'contentHeaderView': 'foreground/view/contentHeaderView',
        'contextMenuView': 'foreground/view/contextMenuView',
        'createPlaylistView': 'foreground/view/createPlaylistView',
        'deletePlaylistView': 'foreground/view/deletePlaylistView',
        'dialogView': 'foreground/view/dialogView',
        'editPlaylistView': 'foreground/view/editPlaylistView',
        'genericPromptView': 'foreground/view/genericPromptView',
        'reloadView': 'foreground/view/reloadView',
        'saveSelectedView': 'foreground/view/saveSelectedView',
        'saveVideosView': 'foreground/view/saveVideosView',
        'settingsView': 'foreground/view/settingsView',

        //  View -> ActiveFolderArea:
        'activeFolderAreaView': 'foreground/view/activeFolderArea/activeFolderAreaView',
        'activeFolderView': 'foreground/view/activeFolderArea/activeFolderView',
        'deletePlaylistButtonView': 'foreground/view/activeFolderArea/deletePlaylistButtonView',
        'playlistView': 'foreground/view/activeFolderArea/playlistView',

        //  View -> ActivePlaylistArea:
        'activePlaylistAreaView': 'foreground/view/activePlaylistArea/activePlaylistAreaView',
        'activePlaylistItemsView': 'foreground/view/activePlaylistArea/activePlaylistItemsView',
        'addAllButtonView': 'foreground/view/activePlaylistArea/addAllButtonView',
        'playAllButtonView': 'foreground/view/activePlaylistArea/playAllButtonView',
        'playlistItemView': 'foreground/view/activePlaylistArea/playlistItemView',

        //  View -> RightPane:
        'nextButtonView': 'foreground/view/rightPane/nextButtonView',
        'playPauseButtonView': 'foreground/view/rightPane/playPauseButtonView',
        'previousButtonView': 'foreground/view/rightPane/previousButtonView',
        'rightPaneView': 'foreground/view/rightPane/rightPaneView',
        'timeProgressAreaView': 'foreground/view/rightPane/timeProgressAreaView',
        'videoDisplayButtonView': 'foreground/view/rightPane/videoDisplayButtonView',
        'volumeControlView': 'foreground/view/rightPane/volumeControlView',

        //  View -> RightPane -> Stream:
        'clearStreamButtonView': 'foreground/view/rightPane/stream/clearStreamButtonView',
        'radioButtonView': 'foreground/view/rightPane/stream/radioButtonView',
        'repeatButtonView': 'foreground/view/rightPane/stream/repeatButtonView',
        'saveStreamButtonView': 'foreground/view/rightPane/stream/saveStreamButtonView',
        'shuffleButtonView': 'foreground/view/rightPane/stream/shuffleButtonView',
        'streamItemView': 'foreground/view/rightPane/stream/streamItemView',
        'streamView': 'foreground/view/rightPane/stream/streamView',

        //  View -> Video:
        'videoDisplayView': 'foreground/view/video/videoDisplayView',

        //  View -> VideoSearch:
        'addSearchResultOptionView': 'foreground/view/videoSearch/addSearchResultOptionView',
        'addSearchResultsView': 'foreground/view/videoSearch/addSearchResultsView',
        'playSelectedButtonView': 'foreground/view/videoSearch/playSelectedButtonView',
        'saveSelectedButtonView': 'foreground/view/videoSearch/saveSelectedButtonView',
        'videoSearchResultsView': 'foreground/view/videoSearch/videoSearchResultsView',
        'videoSearchResultView': 'foreground/view/videoSearch/videoSearchResultView',
        'videoSearchView': 'foreground/view/videoSearch/videoSearchView'
        
    }
    
});

require([
    'jquery',
    'lodash',
    'backbone',
    'lazyload',
    'transit',
    'selectize',
    'autoscroll',
    'hoverIntent',
    'jqueryUi',
    'scrollIntoView'
], function () {
    'use strict';
    
    require(['foreground']);
});