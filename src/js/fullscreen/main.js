require.config({
    
    baseUrl: '../js/',
    
    shim: {

        'backbone': {
            //  These script dependencies should be loaded before loading backbone.js
            deps: ['lodash', 'jquery'],
            //  Once loaded, use the global 'Backbone' as the module value.
            exports: 'Backbone'
        }

    },
    
    paths: {
        'fullscreen': 'fullscreen/fullscreen',
        'jquery': 'thirdParty/jquery',
        'backbone': 'thirdParty/backbone',
        'lodash': 'thirdParty/lodash',

        //  Model:
        'contextMenu': 'foreground/model/contextMenu'
    }
    
});

require([
    'jquery',
    'backbone',
    'underscore'
], function () {
    'use strict';

    require(['fullscreen']);
});