define(function () {
    'use strict';
    
    //  Only log errors with less.
    //  http://lesscss.org/usage/
    window.less = {
        logLevel: 1
    };
    
    require.config({
        baseUrl: 'js/',
        enforceDefine: true,

        paths: {
            //  Paths:
            'template': '../template',

            //  Third Party:
            'async': 'thirdParty/async',
            'backbone': 'thirdParty/backbone',
            'backbone.localStorage': 'thirdParty/backbone.localStorage',
            'backbone.marionette': 'thirdParty/backbone.marionette',
            //  TODO: I don't think chai/mocha/sinon should be known here, but maaaybe.
            'chai': 'thirdParty/chai',
            'googleAnalytics': 'thirdParty/googleAnalytics',
            'jquery.hoverIntent': 'thirdParty/jquery.hoverIntent',
            'jquery': 'thirdParty/jquery',
            'jquery.qtip': 'thirdParty/jquery.qtip',
            'jquery.transit': 'thirdParty/jquery.transit',
            'jquery-ui': 'thirdParty/jquery-ui',
            'less': 'thirdParty/less',
            //  Rename lodash to underscore since functionality equivilant but underscore is expected by other third party libraries.
            'underscore': 'thirdParty/lodash',
            'mocha': 'thirdParty/mocha',
            'selectize': 'thirdParty/selectize',
            'sinon': 'thirdParty/sinon',
            'text': 'thirdParty/text'
        },

        shim: {
            'googleAnalytics': {
                deps: ['jquery'],
                exports: '_gaq'
            },
            'jquery.hoverIntent': {
                deps: ['jquery'],
                exports: '$.fn.hoverIntent'
            },
            'jquery.transit': {
                deps: ['jquery'],
                exports: '$.transit'
            },
            'less': {
                exports: 'window.less'
            },
            'mocha': {
                exports: 'window.mocha'
            },
            'sinon': {
                exports: 'window.sinon'
            }
        }
    });
});