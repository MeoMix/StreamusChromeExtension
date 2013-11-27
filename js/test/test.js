define([
    'dataSourceTest',
    'errorTest',
    'utilityTest',
    'youTubeV2APITest',
    'youTubeV3APITest'
], function (DataSourceTest, ErrorTest, UtilityTest, YouTubeV2APITest, YouTubeV3APITest) {
    'use strict';

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

