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
            'backbone.foreground': 'thirdParty/backbone.foreground',
            'backbone.localStorage': 'thirdParty/backbone.localStorage',
            'backbone.localStorage.foreground': 'thirdParty/backbone.localStorage.foreground',
            'backbone.marionette': 'thirdParty/backbone.marionette',
            'backbone.marionette.foreground': 'thirdParty/backbone.marionette.foreground',
            'cocktail': 'thirdParty/cocktail',
            'jquery': 'thirdParty/jquery',
            'jquery.perfectScrollbar': 'thirdParty/jquery.perfectScrollbar',
            'jquery.qtip': 'thirdParty/jquery.qtip',
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