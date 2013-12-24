require.config({

    baseUrl: '../src/js/',
	
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

        //  Third Party:
        async: 'thirdParty/async',
        backbone: 'thirdParty/backbone',
        jasmineHtml: 'thirdParty/jasmine-html',
        jasmine: 'thirdParty/jasmine',
        jquery: 'thirdParty/jquery',
        lodash: 'thirdParty/lodash',
        
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

    require(['background/model/settings'], function (Settings) {
        //  Enable testing in Settings so configuration values can be set accordingly (API keys, etc. testing runs on localhost)
        Settings.set('testing', true);
        //  Testing should hit a local server and not be ran against the production database.
        Settings.set('localDebug', true);
    });

    require(['test']);
});