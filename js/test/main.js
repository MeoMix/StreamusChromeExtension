require.config({

    baseUrl: '../js/',

    shim: {

        'backbone': {
            //  These script dependencies should be loaded before loading backbone.js
            deps: ['lodash', 'jquery'],
            //  Once loaded, use the global 'Backbone' as the module value.
            exports: 'Backbone'
        },
        
        'googleApiClient': {
            exports: 'GoogleApiClient'
        },

        'jasmine-html': ['jasmine'],
        
        'lodash': {
            exports: '_'
        }

    },

    //  It's easier to define all the paths once rather than bloat each file with long paths during the require (keeps things DRY)
    paths: {

        //  Global:        
        'dataSource': 'dataSource',
        'utility': 'utility',
        'youTubeV2API': 'youTubeV2API',
        'youTubeV3API': 'youTubeV3API',

        //  Enum:
        'addSearchResultOptionType': 'enum/addSearchResultOptionType',
        'dataSourceType': 'enum/dataSourceType',
        'playerState': 'enum/playerState',
        'repeatButtonState': 'enum/repeatButtonState',

        //  Third Party:
        'backbone': 'thirdParty/backbone',
        'jasmine-html': 'thirdParty/jasmine-html',
        'jasmine': 'thirdParty/jasmine',
        'jquery': 'thirdParty/jquery',
        'lodash': 'thirdParty/lodash',
        'googleApiClient': 'thirdParty/googleApiClient',
        
        //  Background:
        'error': 'background/model/error',
        'settings': 'background/model/settings',
        
        //  Test:
        'dataSourceTest': 'test/dataSourceTest',
        'errorTest': 'test/errorTest',
        'test': 'test/test',
        'utilityTest': 'test/utilityTest',
        'youTubeV2APITest': 'test/youTubeV2APITest',
        'youTubeV3APITest': 'test/youTubeV3ApiTest'
    }

});

require([
    'settings',
    'backbone',
    'jasmine-html',
    'jasmine',
    'jquery',
    'lodash',
    'googleApiClient'
], function (Settings) {
    'use strict';

    //  Enable testing in Settings so configuration values can be set accordingly (API keys, etc. testing runs on localhost)
    Settings.set('testing', true);
    //  Testing should hit a local server and not be ran against the production database.
    Settings.set('localDebug', true);

    require(['test']);
});