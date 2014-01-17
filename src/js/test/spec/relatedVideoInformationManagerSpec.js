define([
    'common/model/relatedVideoInformationManager'
], function (RelatedVideoInformationManager) {
    'use strict';
    
    //  TODO: Learn how to use Spys properly and monitor how many times RelatedVideoManager issues requests.
    describe('RelatedVideoInformationManager', function () {

        it('Should be able to get a queue requests for related video information', function() {

            var requests = [{
                videoId: 'btDPtzCGNTE',
                success: function(){}
            }, {
                videoId: 'btDPtzCGNTE',
                success: function () { }
            }, {
                videoId: 'btDPtzCGNTE',
                success: function () { }
            }, {
                videoId: 'btDPtzCGNTE',
                success: function () { }
            }, {
                videoId: 'btDPtzCGNTE',
                success: function () { }
            }, {
                videoId: 'btDPtzCGNTE',
                success: function () { }
            }, {
                videoId: 'btDPtzCGNTE',
                success: function () { }
            }, {
                videoId: 'btDPtzCGNTE',
                success: function () { }
            }, {
                videoId: 'btDPtzCGNTE',
                success: function () { }
            }, {
                videoId: 'btDPtzCGNTE',
                success: function () { }
            }];

            runs(function () {
                _.each(requests, function (request) {
                    RelatedVideoInformationManager.getRelatedVideoInformation(request);
                });
            });

            waitsFor(function () {
                return RelatedVideoInformationManager.get('concurrentRequestCount') > 0;
            }, "concurrentRequestCount should have been incremented", 2000);

            runs(function() {
                expect(RelatedVideoInformationManager.get('requestQueue').length).toBeGreaterThan(0);
            });

        });

        it('Should be able to get a video\'s related video information', function () {
            var relatedVideoInformation = null;
            runs(function () {
                RelatedVideoInformationManager.getRelatedVideoInformation({
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

