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
        'youTubeDataAPI': 'youTubeDataAPI',
        'utility': 'utility',

        //  Enum:
        'addSearchResultOptionType': 'enum/addSearchResultOptionType',
        'dataSource': 'enum/dataSource',
        'playerState': 'enum/playerState',
        'repeatButtonState': 'enum/repeatButtonState',

        //  Third Party:
        'backbone': 'thirdParty/backbone',
        'jasmine-html': 'thirdParty/jasmine-html',
        'jasmine': 'thirdParty/jasmine',
        'jquery': 'thirdParty/jquery',
        'lodash': 'thirdParty/lodash',
        'googleApiClient': 'thirdParty/googleApiClient',
        
        //  Test:
        'test': 'test/test',
        'utilityTest': 'test/utilityTest',
        'youTubeDataApiTest': 'test/youTubeDataApiTest'
    }

});

require([
    'backbone',
    'jasmine-html',
    'jasmine',
    'jquery',
    'lodash',
    'googleApiClient'
], function () {
    'use strict';

    require(['test']);
});