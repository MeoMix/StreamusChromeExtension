require.config({
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
    }
});

require([
    'jquery',
    'backbone',
    'underscore'
], function ($, Backbone, _) {
    'use strict';

    require(['fullscreen']);
});