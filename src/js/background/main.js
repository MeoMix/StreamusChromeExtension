require([
    '../common/requireConfig'
], function (requireConfig) {
    'use strict';
    
    require.config(requireConfig);

    //  Then, load all of the plugins needed by the background:
    require(['background/plugins']);
});