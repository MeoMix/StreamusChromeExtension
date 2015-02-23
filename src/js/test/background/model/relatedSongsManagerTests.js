define(function (require) {
    'use strict';

    var RelatedSongsManager = require('background/model/relatedSongsManager');

    describe('RelatedSongsManager', function () {
        beforeEach(function () {
            sinon.stub($, 'ajax');
            this.relatedSongsManager = new RelatedSongsManager();
        });
        
        afterEach(function () {
            $.ajax.restore();
        });

        it('Should be able to get a queue requests for related song information', function () {
            var requests = [];
            
            for (var count = 0; count < 10; count++) {
                requests.push({
                    songId: 'btDPtzCGNTE',
                    success: _.noop
                });
            }

            _.each(requests, function (request) {
                this.relatedSongsManager.getRelatedSongs(request);
            }, this);

            expect(this.relatedSongsManager.get('requestOptionsQueue').length).to.equal(requests.length - this.relatedSongsManager.get('maxRequestCount'));
            expect(this.relatedSongsManager.get('currentRequestCount')).to.equal(this.relatedSongsManager.get('maxRequestCount'));
        });

        it('should not be able to request when currentRequestCount is equal to maxRequestCount', function () {
            this.relatedSongsManager.set('currentRequestCount', this.relatedSongsManager.get('maxRequestCount'));
            expect(this.relatedSongsManager._canRequest()).to.equal(false);
        });
    });
});

