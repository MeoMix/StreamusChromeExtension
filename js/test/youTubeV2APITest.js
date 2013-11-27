define([
    'youTubeV2API'
], function (YouTubeV2API) {
    'use strict';

    describe('YouTubeV2API', function () {

        it('Should be able to get a video\'s related video information', function () {
            var relatedVideoInformation = null;
            runs(function () {
                YouTubeV2API.getRelatedVideoInformation({
                    videoId: 'CxHFnVCZDRo',
                    success: function(response) {
                        relatedVideoInformation = response;
                    }
                });
            }, 500);
            
            waitsFor(function () {
                return relatedVideoInformation !== null;
            }, "RelatedVideoInformation should be set", 2000);

            runs(function () {

                var videos = _.map(relatedVideoInformation, function (info) {
                    return {
                        id: info.media$group.yt$videoid.$t,
                        title: info.title.$t
                    };
                });
                
                console.log("V2:");
                console.table(videos);
                expect(relatedVideoInformation.length).toBeGreaterThan(0);
                expect(relatedVideoInformation.length).toBe(10);
            });

        });

    });
    
});

