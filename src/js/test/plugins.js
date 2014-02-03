define([
    'backbone',
    'jquery.hoverIntent',
    'jquery',
    'jquery.qtip',
    'jquery.scrollIntoView',
    'jquery.transit',
    'jqueryUi',
    'keymaster',
    'lodash',
    'selectize'
], function () {
    
    require(['background/model/settings'], function (Settings) {
        //  Enable testing in Settings so configuration values can be set accordingly (API keys, etc. testing runs on localhost)
        Settings.set('testing', true);
        //  Testing should hit a local server and not be ran against the production database.
        Settings.set('localDebug', true);
    });

    //  Finally, load the tests:
    require(['test/test']);
});