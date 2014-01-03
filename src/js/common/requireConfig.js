define(function () {

    require.config({

        baseUrl: 'js/',

        enforceDefine: true,

        shim: {

            'backbone': {
                //  These script dependencies should be loaded before loading backbone.js
                deps: ['lodash', 'jquery'],
                //  Once loaded, use the global 'Backbone' as the module value.
                exports: 'Backbone'
            },

            'googleAnalytics': {
                deps: ['jquery'],
                exports: '_gaq'
            },

            'jquery.autoscroll': {
                deps: ['jquery'],
                exports: '$.fn.autoscroll'
            },
            'jquery.hoverIntent': {
                deps: ['jquery'],
                exports: '$.fn.hoverIntent'
            },
            'jquery.lazyload': {
                deps: ['jquery'],
                exports: '$.fn.lazyload'
            },
            'jquery.scrollIntoView': {
                deps: ['jquery'],
                exports: '$.fn.scrollIntoView'
            },
            'jquery.transit': {
                deps: ['jquery'],
                exports: '$.transit'
            },
            'jqueryUi': {
                deps: ['jquery'],
                exports: '$.ui'
            },
            'keymaster': {
                exports: 'window.key'
            }

        },

        paths: {

            //  Paths:
            'template': '../template',

            //  Third Party:
            'async': 'thirdParty/async',
            'backbone': 'thirdParty/backbone',
            'googleAnalytics': 'thirdParty/googleAnalytics',
            'jquery.autoscroll': 'thirdParty/jquery.autoscroll',
            'jquery.hoverIntent': 'thirdParty/jquery.hoverIntent',
            'jquery': 'thirdParty/jquery',
            'jquery.lazyload': 'thirdParty/jquery.lazyload',
            'jquery.qtip': 'thirdParty/jquery.qtip',
            'jquery.scrollIntoView': 'thirdParty/jquery.scrollIntoView',
            'jquery.transit': 'thirdParty/jquery.transit',
            'jqueryUi': 'thirdParty/jqueryUi',
            'keymaster': 'thirdParty/keymaster',
            'lodash': 'thirdParty/lodash',
            'microplugin': 'thirdParty/microplugin',
            'selectize': 'thirdParty/selectize',
            'sifter': 'thirdParty/sifter',
            'text': 'thirdParty/text'
        }

    });
});