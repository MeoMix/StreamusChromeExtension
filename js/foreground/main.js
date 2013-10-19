//  The foreground can be destroyed, but with a log message still attempting to execute. This wrapper ensures logging doesn't throw errors.
console = window && console;

require.config({
    
    baseUrl: '../js/',

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
        transit: ['jquery'],
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
        'hoverIntent': 'thirdParty/jquery.hoverIntent',
        'jquery': 'thirdParty/jquery',
        'jqueryUi': 'thirdParty/jqueryUi',
        'lazyload': 'thirdParty/jquery.lazyload',
        'transit': 'thirdParty/jquery.transit',
        'levenshtein': 'thirdParty/levenshtein',
        'scrollIntoView': 'thirdParty/jquery.scrollIntoView',
        'underscore': 'thirdParty/underscore',
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
        'settings': 'foreground/model/settings',
        'spinnerBuilder': 'foreground/model/spinnerBuilder',
        'videoSearch': 'foreground/model/videoSearch',
        'videoSearchResult': 'foreground/model/videoSearchResult',

        //  Model -> Buttons:
        'playPauseButton': 'foreground/model/buttons/playPauseButton',

        //  View:
        'contentHeaderView': 'foreground/view/contentHeaderView',
        'contextMenuView': 'foreground/view/contextMenuView',
        'createPlaylistPromptView': 'foreground/view/createPlaylistPromptView',
        'dialogView': 'foreground/view/dialogView',
        'genericPromptView': 'foreground/view/genericPromptView',
        'headerTitleView': 'foreground/view/headerTitleView',
        'loadingSpinnerView': 'foreground/view/loadingSpinnerView',
        'progressBarView': 'foreground/view/progressBarView',
        'reloadPromptView': 'foreground/view/reloadPromptView',
        'settingsPromptView': 'foreground/view/settingsPromptView',

        //  View -> ActiveFolderArea:
        'activeFolderAreaView': 'foreground/view/activeFolderArea/activeFolderAreaView',
        'activeFolderView': 'foreground/view/activeFolderArea/activeFolderView',
        'playlistInputView': 'foreground/view/activeFolderArea/playlistInputView',
        'playlistView': 'foreground/view/activeFolderArea/playlistView',

        //  View -> ActivePlaylistArea:
        'activePlaylistAreaView': 'foreground/view/activePlaylistArea/activePlaylistAreaView',
        'activePlaylistItemsView': 'foreground/view/activePlaylistArea/activePlaylistItemsView',
        'playlistItemInputView': 'foreground/view/activePlaylistArea/playlistItemInputView',
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
        'videoSearchResultsView': 'foreground/view/videoSearch/videoSearchResultsView',
        'videoSearchResultView': 'foreground/view/videoSearch/videoSearchResultView',
        'videoSearchView': 'foreground/view/videoSearch/videoSearchView'
        
    }
    
});

require([
    'jquery',
    'underscore',
    'backbone',
    'lazyload',
    'transit',
    'hoverIntent',
    'jqueryUi',
    'scrollIntoView'
], function () {
    'use strict';
    
    require(['foreground']);
});