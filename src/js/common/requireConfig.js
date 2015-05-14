//define({
//    baseUrl: 'js/',
//    enforceDefine: true,

//    paths: {
//        //  Paths:
//        'template': '../template',

//        //  Third Party:
//        'backbone': 'thirdParty/backbone',
//        'backbone.localStorage': 'thirdParty/backbone.localStorage',
//        'backbone.marionette': 'thirdParty/backbone.marionette',
//        'jquery': 'thirdParty/jquery',
//        //  Rename lodash to underscore since functionally equivilant but underscore is expected by other third party libraries.
//        'underscore': 'thirdParty/lodash',
//        'text': 'thirdParty/text'
//    }
//});

define(function() {
    'use strict';

    require.config({
        baseUrl: 'js/',
        enforceDefine: true,

        paths: {
            //  Paths:
            'template': '../template',

            //  Third Party:
            'backbone': 'thirdParty/backbone',
            'backbone.localStorage': 'thirdParty/backbone.localStorage',
            'backbone.marionette': 'thirdParty/backbone.marionette',
            'cocktail': 'thirdParty/cocktail',
            'jquery': 'thirdParty/jquery',
            'jquery.perfectScrollbar': 'thirdParty/jquery.perfectScrollbar',
            'jquery-ui': 'thirdParty/jquery-ui',
            'lodash': 'thirdParty/lodash',
            'text': 'thirdParty/text'
        },

        shim: {
            'https://www.google-analytics.com/analytics.js': {
                exports: 'window.ga'
            }
        },
        
        map: {
            '*': {
                'underscore': 'lodash'
            }
        }
    });
});