//  Start by loading the requireJS configuration file which is kept DRY between all pages:
require([
    '../requireConfig'
], function () {
    'use strict';

    //  Then, load all of the plugins needed by the background:
    require(['background/plugins']);
});