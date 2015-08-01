define(function(require) {
  'use strict';

  var RelatedVideosManager = require('background/model/relatedVideosManager');

  describe('RelatedVideosManager', function() {
    beforeEach(function() {
      sinon.stub($, 'ajax');
      this.relatedVideosManager = new RelatedVideosManager();
    });

    afterEach(function() {
      $.ajax.restore();
    });

    it('Should be able to get a queue requests for related video information', function() {
      var requests = [];

      for (var count = 0; count < 10; count++) {
        requests.push({
          videoId: 'btDPtzCGNTE',
          success: _.noop
        });
      }

      _.each(requests, function(request) {
        this.relatedVideosManager.getRelatedVideos(request);
      }, this);

      var maxRequestCount = this.relatedVideosManager.get('maxRequestCount');
      var requestOptionsQueue = this.relatedVideosManager.get('requestOptionsQueue');
      expect(requestOptionsQueue.length).to.equal(requests.length - maxRequestCount);

      var currentRequestCount = this.relatedVideosManager.get('currentRequestCount');
      expect(currentRequestCount).to.equal(maxRequestCount);
    });

    it('should not be able to request when currentRequestCount is equal to maxRequestCount', function() {
      var maxRequestCount = this.relatedVideosManager.get('maxRequestCount');
      this.relatedVideosManager.set('currentRequestCount', maxRequestCount);
      expect(this.relatedVideosManager._canRequest()).to.equal(false);
    });
  });
});