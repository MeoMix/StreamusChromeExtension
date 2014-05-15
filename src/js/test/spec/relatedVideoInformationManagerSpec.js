define([
    'background/model/relatedSongInformationManager'
], function (RelatedSongInformationManager) {
    'use strict';
    
    describe('RelatedSongInformationManager', function () {

        it('Should be able to get a queue requests for related song information', function() {

            var requests = [{
                songId: 'btDPtzCGNTE',
                success: function(){}
            }, {
                songId: 'btDPtzCGNTE',
                success: function () { }
            }, {
                songId: 'btDPtzCGNTE',
                success: function () { }
            }, {
                songId: 'btDPtzCGNTE',
                success: function () { }
            }, {
                songId: 'btDPtzCGNTE',
                success: function () { }
            }, {
                songId: 'btDPtzCGNTE',
                success: function () { }
            }, {
                songId: 'btDPtzCGNTE',
                success: function () { }
            }, {
                songId: 'btDPtzCGNTE',
                success: function () { }
            }, {
                songId: 'btDPtzCGNTE',
                success: function () { }
            }, {
                songId: 'btDPtzCGNTE',
                success: function () { }
            }];

            runs(function () {
                _.each(requests, function (request) {
                    RelatedSongInformationManager.getRelatedSongInformation(request);
                });
            });

            waitsFor(function () {
                return RelatedSongInformationManager.get('concurrentRequestCount') > 0;
            }, "concurrentRequestCount should have been incremented", 2000);

            runs(function() {
                expect(RelatedSongInformationManager.get('requestQueue').length).toBeGreaterThan(0);
            });

        });

        it('Should be able to get a song\'s related information', function () {
            var relatedSongInformation = null;
            runs(function () {
                RelatedSongInformationManager.getRelatedSongInformation({
                    songId: 'btDPtzCGNTE',
                    success: function(response) {
                        relatedSongInformation = response;
                    }
                });
            }, 500);
            
            waitsFor(function () {
                return relatedSongInformation !== null;
            }, "RelatedSongInformation should be set", 2000);

            runs(function () {

                var songs = _.map(relatedSongInformation, function (info) {
                    return {
                        id: info.media$group.yt$videoid.$t,
                        title: info.title.$t
                    };
                });
                    
                //console.table(songs);
                expect(relatedSongInformation.length).toBeGreaterThan(0);
                expect(relatedSongInformation.length).toBe(10);
            });

        });

    });
    
});

