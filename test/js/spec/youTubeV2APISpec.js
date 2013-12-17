define([
    'youTubeV2API'
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
                expect(videoInformation.title.length).toBeGreaterThan(0);
            });
        });

        it('Should be able to get a video\'s related video information', function () {
            var relatedVideoInformation = null;
            runs(function () {
                YouTubeV2API.getRelatedVideoInformation({
                    videoId: 'btDPtzCGNTE',
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
                
                //console.table(videos);
                expect(relatedVideoInformation.length).toBeGreaterThan(0);
                expect(relatedVideoInformation.length).toBe(10);
            });

        });

    });
    
});

