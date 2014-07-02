define(function () {
    'use strict';
    
    require.config({
        baseUrl: 'js/',
        enforceDefine: true,

        paths: {
            //  Paths:
            'template': '../template',

            //  Third Party:
            'async': 'thirdParty/async',
            'boot': 'thirdParty/boot',
            'backbone': 'thirdParty/backbone',
            'backbone.localStorage': 'thirdParty/backbone.localStorage',
            'backbone.marionette': 'thirdParty/backbone.marionette',
            'googleAnalytics': 'thirdParty/googleAnalytics',
            'jasmine': 'thirdParty/jasmine',
            'jasmine-html': 'thirdParty/jasmine-html',
            'jquery.hoverIntent': 'thirdParty/jquery.hoverIntent',
            'jquery': 'thirdParty/jquery',
            'jquery.qtip': 'thirdParty/jquery.qtip',
            'jquery.transit': 'thirdParty/jquery.transit',
            'jquery-ui': 'thirdParty/jquery-ui',
            'less': 'thirdParty/less',
            'lodash': 'thirdParty/lodash',
            'selectize': 'thirdParty/selectize',
            'text': 'thirdParty/text'
        },

        shim: {
            'boot': {
                deps: ['jasmine', 'jasmine-html'],
                exports: 'window.jasmineRequire'
            },
            'googleAnalytics': {
                deps: ['jquery'],
                exports: '_gaq'
            },
            'jasmine': {
                exports: 'window.jasmineRequire'
            },
            'jasmine-html': {
                deps: ['jasmine'],
                exports: 'window.jasmineRequire'
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
            }
        }
    });
});