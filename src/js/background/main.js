define([
    '../common/requireConfig'
], function() {
    'use strict';

    //  TODO: Does.. this actually do what I think? Isn't this sugar syntax so it always loads randomly?
    //  Then, load all of the plugins needed by the background:
    require(['background/plugins']);
});