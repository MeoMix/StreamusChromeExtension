define([
    'settings',
    'utilityTest',
    'youTubeV2APITest',
    'youTubeV3APITest'
], function (Settings, UtilityTest, YouTubeV2APITest, YouTubeV3APITest) {
    'use strict';
    //  Enable testing in Settings so configuration values can be set accordingly (API keys, etc. testing runs on localhost)
    Settings.set('testing', true);
    
    //  Load up all the specs we're testing.
    var jasmineEnv = jasmine.getEnv();
    jasmineEnv.updateInterval = 1000;

    var htmlReporter = new jasmine.HtmlReporter();

    jasmineEnv.addReporter(htmlReporter);

    jasmineEnv.specFilter = function (spec) {
        return htmlReporter.specFilter(spec);
    };

    jasmineEnv.execute();
    
});

