require.config({
    
    baseUrl: '../js/',
    
    shim: {

        'backbone': {
            //  These script dependencies should be loaded before loading backbone.js
            deps: ['lodash', 'jquery'],
            //  Once loaded, use the global 'Backbone' as the module value.
            exports: 'Backbone'
        },
        
        //  For "modules" that are just jQuery or Backbone plugins that do not need to export any module value, the shim config can just be an array of dependencies:
        'jqueryUi': ['jquery']
    },
    
    paths: {
        'options': 'options/options',
        'settings': 'options/settings',
        'settingsView': 'foreground/view/settingsView',
        'player': 'options/player',
        
        //  Third Party:
        'text': 'thirdParty/text',
        'jquery': 'thirdParty/jquery',
        'jqueryUi': 'thirdParty/jqueryUi',
        'backbone': 'thirdParty/backbone',
        'lodash': 'thirdParty/lodash',
    }
    
});

require([
    'jquery',
    'backbone',
    'lodash',
    'jqueryUi'
], function ($, Backbone, _) {
    'use strict';

    //  Load this once everything else is ready.
    require(['options']);
});