define(function(require) {
  'use strict';

  var Videos = require('background/collection/videos');

  describe('Videos', function() {
    beforeEach(function() {
      this.videos = new Videos();
    });

    describe('when determining total duration of videos in collection', function() {
      it('should say 0 when empty', function() {
        var totalDuration = this.videos._getTotalDuration();
        expect(totalDuration).to.equal(0);
      });

      it('should know how long a single video is in seconds', function() {
        var video = TestUtility.buildVideo();
        this.videos.add(video);

        var totalDuration = this.videos._getTotalDuration();
        var videoDuration = parseInt(video.get('duration'), 10);
        expect(totalDuration).to.equal(videoDuration);
      });

      it('should know how long multiple videos are in seconds', function() {
        var video1 = TestUtility.buildVideo();
        this.videos.add(video1);

        var video2 = TestUtility.buildVideo('LpDV6uO-99k');
        this.videos.add(video2);

        var totalDuration = this.videos._getTotalDuration();
        var video1Duration = parseInt(video1.get('duration'), 10);
        var video2Duration = parseInt(video2.get('duration'), 10);
        expect(totalDuration).to.equal(parseInt(video1Duration + video2Duration));
      });
    });
  });
});