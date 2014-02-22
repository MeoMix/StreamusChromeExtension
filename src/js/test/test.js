define([
      'test/spec/playlistItemsSpec',
    //'test/spec/streamItemsSpec',
    //'test/spec/relatedVideoInformationManagerSpec',
    //'test/spec/dataSourceSpec',
    //'test/spec/errorSpec',
    //'test/spec/googleAPISpec',
    //'test/spec/utilitySpec',
    //'test/spec/youTubeV2APISpec',
    //'test/spec/youTubeV3APISpec'
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