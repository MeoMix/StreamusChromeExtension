require([
    '../common/requireConfig'
], function (requireConfig) {
    'use strict';
    
    //  Only log errors with less.
    //  http://lesscss.org/usage/
    window.less = {
        logLevel: 1
    };

    require.config(requireConfig);
    
    //  Load all of the plugins needed by the foreground:
    require(['foreground/plugins']);
});