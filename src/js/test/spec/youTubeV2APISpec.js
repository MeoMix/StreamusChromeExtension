define([
    'common/model/youTubeV2API'
], function (YouTubeV2API) {
    'use strict';
    
    //  TODO: Test this banned video ID: mNGpPqxsTmQ

    describe('YouTubeV2API', function ()  {
    
        it('Should be able to get a video\'s information', function () {
            var videoInformation = null;
            runs(function () {
                YouTubeV2API.getVideoInformation({
                    videoId: 'btDPtzCGNTE',
                    success: function (response) {
                        videoInformation = response;
                    }
                });
            }, 500);
            
            waitsFor(function () {
                return videoInformation !== null;
            }, "RelatedVideoInformation should be set", 2000);
            
        });

        it('Should be able to find a playable video by title', function() {
            var videoInformation = null;
            runs(function () {
                YouTubeV2API.findPlayableByTitle({
                    title: 'Gramatik',
                    success: function (response) {
                        videoInformation = response;
                    }
                });
            }, 500);

            waitsFor(function () {
                return videoInformation !== null;
            }, "VideoInformation should be set", 2000);

            runs(function () {
                expect(videoInformation.title.$t.length).toBeGreaterThan(0);
            });
        });

    });
    
});

