require.config({

    baseUrl: 'js/',

    shim: {

        'backbone': {
            //  These script dependencies should be loaded before loading backbone.js
            deps: ['lodash', 'jquery'],
            //  Once loaded, use the global 'Backbone' as the module value.
            exports: 'Backbone'
        },

        'googleAnalytics': {
            deps: ['jquery']
        },

        //  For "modules" that are just jQuery or Backbone plugins that do not need to export any module value, the shim config can just be an array of dependencies:
        'jquery.autoscroll': ['jquery'],
        'jquery.hoverIntent': ['jquery'],
        'jquery.lazyload': ['jquery'],
        'jquery.scrollIntoView': ['jquery'],
        'jquery.transit': ['jquery'],
        'jqueryUi': ['jquery']

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
        'lodash': 'thirdParty/lodash',
        'microplugin': 'thirdParty/microplugin',
        'selectize': 'thirdParty/selectize',
        'sifter': 'thirdParty/sifter',
        'text': 'thirdParty/text'
    }

});