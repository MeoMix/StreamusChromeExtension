define([
    'youTubeV2API'
], function (YouTubeV2API) {
    'use strict';

    describe('YouTubeV2API', function () {

        it('Should be able to get a video\'s related video information', function () {
            var relatedVideoInformation = null;
            runs(function () {
                YouTubeV2API.getRelatedVideoInformation({
                    videoId: 'MKS8Jn_3bnA',
                    success: function(response) {
                        relatedVideoInformation = response;
                    }
                });
            }, 500);
            
            waitsFor(function () {
                return relatedVideoInformation !== null;
            }, "RelatedVideoInformation should be set", 2000);

            runs(function () {
                expect(relatedVideoInformation.length).toBeGreaterThan(0);
                expect(relatedVideoInformation.length).toBe(10);
            });

        });

    });
    
});

