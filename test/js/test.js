define([
    'spec/dataSourceSpec',
    'spec/errorSpec',
    'spec/googleAPISpec',
    'spec/utilitySpec',
    'spec/youTubeV2APISpec',
    'spec/youTubeV3APISpec'
], function () {
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