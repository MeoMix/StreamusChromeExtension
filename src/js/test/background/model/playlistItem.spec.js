define(function(require) {
  'use strict';

  var PlaylistItem = require('background/model/playlistItem');

  describe('PlaylistItem', function() {
    it('Should set its title properly when being created with a Video object', function() {
      var video = TestUtility.buildVideo();

      var playlistItem = new PlaylistItem({
        title: video.get('title'),
        video: video
      });

      expect(playlistItem.get('title')).to.equal(video.get('title'));
    });

    it('Should set its title properly when being created with raw Video data', function() {
      var video = TestUtility.getRawVideo();

      var playlistItem = new PlaylistItem({
        title: video.title,
        video: video
      });

      expect(playlistItem.get('title')).to.equal(video.title);
    });
  });
});