define({
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
        'googleAnalytics': 'thirdParty/googleAnalytics',
        'jquery': 'thirdParty/jquery',
        'jquery.qtip': 'thirdParty/jquery.qtip',
        'jquery.transit': 'thirdParty/jquery.transit',
        'jquery-ui': 'thirdParty/jquery-ui',
        'less': 'thirdParty/less',
        //  Rename lodash to underscore since functionality equivilant but underscore is expected by other third party libraries.
        'underscore': 'thirdParty/lodash',
        'selectize': 'thirdParty/selectize',
        'text': 'thirdParty/text'
    },

    shim: {
        'googleAnalytics': {
            deps: ['jquery'],
            exports: 'ga'
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