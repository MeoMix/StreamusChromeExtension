define([
    'common/model/youTubeV2API'
], function (YouTubeV2API) {
    'use strict';
    
    //  TODO: Test this banned ID: mNGpPqxsTmQ

    describe('YouTubeV2API', function ()  {
    
        it('Should be able to get a song\'s information', function () {
            var songInformation = null;
            runs(function () {
                YouTubeV3API.getSongInformation({
                    songId: 'btDPtzCGNTE',
                    success: function (response) {
                        songInformation = response;
                    }
                });
            }, 500);
            
            waitsFor(function () {
                return songInformation !== null;
            }, "RelatedSongInformation should be set", 2000);
            
        });

        it('Should be able to find a playable song by title', function() {
            var songInformation = null;
            runs(function () {
                YouTubeV2API.findPlayableByTitle({
                    title: 'Gramatik',
                    success: function (response) {
                        songInformation = response;
                    }
                });
            }, 500);

            waitsFor(function () {
                return songInformation !== null;
            }, "Songnformation should be set", 2000);

            runs(function () {
                expect(songInformation.title.$t.length).toBeGreaterThan(0);
            });
        });

    });
    
});

