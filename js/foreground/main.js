//  The foreground can be destroyed, but with a log message still attempting to execute. This wrapper ensures logging doesn't throw errors.
console = window && console;

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
        //  For "modules" that are just jQuery or Backbone plugins that do not need to export any module value, the shim config can just be an array of dependencies:
        lazyload: ['jquery'],
        jqueryUi: ['jquery'],
        scrollIntoView: ['jquery']
    }
});

require([
    'jquery',
    'underscore',
    'backbone',
    'lazyload',
    'jqueryUi',
    'scrollIntoView'
], function ($, _, Backbone) {
    'use strict';
    
    require(['newForeground']);

});