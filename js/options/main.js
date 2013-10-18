require.config({
    
    baseUrl: '../js/',
    
    shim: {
        underscore: {
            exports: '_'
        },
        backbone: {
            //  These script dependencies should be loaded before loading backbone.js
            deps: ['underscore', 'jquery'],
            //  Once loaded, use the global 'Backbone' as the module value.
            exports: 'Backbone'
        },
        //  For "modules" that are just jQuery or Backbone plugins that do not need to export any module value, the shim config can just be an array of dependencies:
        jqueryUi: ['jquery']
    },
    
    paths: {
        'main': 'options/main',
        'jquery': 'thirdParty/jquery',
        'jqueryUi': 'thirdParty/jqueryUi',
        'backbone': 'thirdParty/backbone',
        'underscore': 'thirdParty/underscore',
        'options': 'options/options',
        'settings': 'options/settings',
        'player': 'options/player'
    }
    
});

require([
    'jquery',
    'backbone',
    'underscore',
    'jqueryUi'
], function ($, Backbone, _) {
    'use strict';

    //  Load this once everything else is ready.
    require(['options']);
});