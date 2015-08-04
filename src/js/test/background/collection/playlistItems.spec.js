define(function(require) {
  'use strict';

  var PlaylistItems = require('background/collection/playlistItems');

  describe('PlaylistItems', function() {
    beforeEach(function() {
      this.playlistItems = new PlaylistItems();
    });

    xdescribe('when calling addVideos', function() {
      it('should support a single video object', function() {

      });

      it('should support an array of video objects', function() {

      });

      it('should support a collection of video models', function() {

      });

      it('should only create videos which were added successfully', function() {

      });

      it('should rely on native Model.save when creating a single video', function() {

      });

      it('should call _bulkCreate when creating multiple videos', function() {

      });
    });

    describe('when asked for display info', function() {
      it('should not error when empty', function() {
        var displayInfo = this.playlistItems.getDisplayInfo();
        expect(displayInfo).not.to.equal('');
      });

      it('should not error when non-empty', function() {
        this.playlistItems.add({
          video: TestUtility.buildVideo()
        });

        var displayInfo = this.playlistItems.getDisplayInfo();
        expect(displayInfo).not.to.equal('');
      });
    });

    describe('when adding a video at an index', function() {
      it('should be able to successfully add a unique video', function() {
        var video = TestUtility.buildVideo();
        var addedPlaylistItem = this.playlistItems._tryAddVideoAtIndex(video, 0);
        expect(addedPlaylistItem).not.to.equal(null);
        expect(this.playlistItems.length).to.equal(1);
      });

      it('should gracefully fail to add a non-unique video', function() {
        var video = TestUtility.buildVideo();
        this.playlistItems._tryAddVideoAtIndex(video, 0);

        var addedPlaylistItem = this.playlistItems._tryAddVideoAtIndex(video, 1);
        expect(addedPlaylistItem).to.equal(null);
        expect(this.playlistItems.length).to.equal(1);
      });
    });

    describe('when creating a bulk amount of items', function() {
      it('should call success callback on success', function(done) {
        sinon.stub($, 'ajax').yieldsTo('success', []);

        this.playlistItems._bulkCreate([], {
          success: function() {
            $.ajax.restore();
            done();
          }
        });
      });

      it('should call error callback on error', function(done) {
        sinon.stub($, 'ajax').yieldsTo('error', []);

        this.playlistItems._bulkCreate([], {
          error: function() {
            $.ajax.restore();
            done();
          }
        });
      });

      it('should map created objects back to its models on success', function(done) {
        var createdObject = {
          video: TestUtility.buildVideo(),
          cid: '123'
        };

        sinon.stub($, 'ajax').yieldsTo('success', [createdObject]);

        this.playlistItems.add({
          video: TestUtility.buildVideo()
        });
        this.playlistItems.at(0).cid = '123';

        this.playlistItems._bulkCreate([], {
          success: function() {
            expect(this.playlistItems.at(0).get('video')).to.equal(createdObject.video);
            $.ajax.restore();
            done();
          }.bind(this)
        });
      });
    });

    it('should be able to map a created object to an existing model', function() {
      var createdObject = {
        cid: '123',
        video: TestUtility.buildVideo()
      };

      this.playlistItems.add({
        video: TestUtility.buildVideo()
      });
      this.playlistItems.at(0).cid = '123';

      this.playlistItems._mapCreatedToExisting(createdObject);
      expect(this.playlistItems.at(0).get('video')).to.equal(createdObject.video);
    });

    it('should be able to get a model by video id', function() {
      var video = TestUtility.buildVideo();

      this.playlistItems.add({
        video: video
      });

      var playlistItem = this.playlistItems._getByVideoId(video.get('id'));
      expect(playlistItem).to.equal(this.playlistItems.at(0));
    });
  });
});