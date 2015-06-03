define(function(require) {
  'use strict';

  var RelatedSongsManager = require('background/model/relatedSongsManager');

  describe('RelatedSongsManager', function() {
    beforeEach(function() {
      sinon.stub($, 'ajax');
      this.relatedSongsManager = new RelatedSongsManager();
    });

    afterEach(function() {
      $.ajax.restore();
    });

    it('Should be able to get a queue requests for related song information', function() {
      var requests = [];

      for (var count = 0; count < 10; count++) {
        requests.push({
          songId: 'btDPtzCGNTE',
          success: _.noop
        });
      }

      _.each(requests, function(request) {
        this.relatedSongsManager.getRelatedSongs(request);
      }, this);

      var maxRequestCount = this.relatedSongsManager.get('maxRequestCount');
      var requestOptionsQueue = this.relatedSongsManager.get('requestOptionsQueue');
      expect(requestOptionsQueue.length).to.equal(requests.length - maxRequestCount);

      var currentRequestCount = this.relatedSongsManager.get('currentRequestCount');
      expect(currentRequestCount).to.equal(maxRequestCount);
    });

    it('should not be able to request when currentRequestCount is equal to maxRequestCount', function() {
      var maxRequestCount = this.relatedSongsManager.get('maxRequestCount');
      this.relatedSongsManager.set('currentRequestCount', maxRequestCount);
      expect(this.relatedSongsManager._canRequest()).to.equal(false);
    });
  });
});