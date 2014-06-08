require([
    //  Start by loading the requireJS configuration file:
    '../common/requireConfig'
], function () {
    'use strict';
    
    //  Load all of the plugins needed by the foreground:
    require(['foreground/plugins']);
});