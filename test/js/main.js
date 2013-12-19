require.config({

    baseUrl: '../app/js/',
	
	//  Cache buster
    //urlArgs: 'cb=' + Math.random(),
    
    //  TODO: Do I want to try and set enforceDefine: true? It seems useful.

    shim: {

        backbone: {
            //  These script dependencies should be loaded before loading backbone.js
            deps: ['lodash', 'jquery'],
            //  Once loaded, use the global 'Backbone' as the module value.
            exports: 'Backbone'
        },

        jasmineHtml: ['jasmine']
       
    },

    //  It's easier to define all the paths once rather than bloat each file with long paths during the require (keeps things DRY)
    paths: {

        //  Global:        
        dataSource: 'dataSource',
        utility: 'utility',
        youTubeV2API: 'youTubeV2API',
        youTubeV3API: 'youTubeV3API',

        //  Enum:
        addSearchResultOptionType: 'enum/addSearchResultOptionType',
        dataSourceType: 'enum/dataSourceType',
        playerState: 'enum/playerState',
        repeatButtonState: 'enum/repeatButtonState',

        //  Third Party:
        async: 'thirdParty/async',
        backbone: 'thirdParty/backbone',
        jasmineHtml: 'thirdParty/jasmine-html',
        jasmine: 'thirdParty/jasmine',
        jquery: 'thirdParty/jquery',
        lodash: 'thirdParty/lodash',
        
        //  Background:
        error: 'background/model/error',
        settings: 'background/model/settings',
		
		//  Spec:
		spec: '../../test/js/spec',
        test: '../../test/js/test'
		
    }

});

require([
    'backbone',
    'jquery',
    'lodash',
	'jasmineHtml',
    'jasmine'
], function () {
    'use strict';

    require(['settings'], function(Settings) {
        //  Enable testing in Settings so configuration values can be set accordingly (API keys, etc. testing runs on localhost)
        Settings.set('testing', true);
        //  Testing should hit a local server and not be ran against the production database.
        Settings.set('localDebug', true);
    });

    require(['test']);
});