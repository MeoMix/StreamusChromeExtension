define(function(require) {
  'use strict';

  var PlaylistItems = require('background/collection/playlistItems');
  var TestUtility = require('test/testUtility');

  describe('PlaylistItems', function() {
    beforeEach(function() {
      this.playlistItems = new PlaylistItems();
    });

    xdescribe('when calling addSongs', function() {
      it('should support a single song object', function() {

      });

      it('should support an array of song objects', function() {

      });

      it('should support a collection of song models', function() {

      });

      it('should only create songs which were added successfully', function() {

      });

      it('should rely on native Model.save when creating a single song', function() {

      });

      it('should call _bulkCreate when creating multiple songs', function() {

      });
    });

    describe('when asked for display info', function() {
      it('should not error when empty', function() {
        var displayInfo = this.playlistItems.getDisplayInfo();
        expect(displayInfo).not.to.equal('');
      });

      it('should not error when non-empty', function() {
        this.playlistItems.add({
          song: TestUtility.buildSong()
        });

        var displayInfo = this.playlistItems.getDisplayInfo();
        expect(displayInfo).not.to.equal('');
      });
    });

    describe('when adding a song at an index', function() {
      it('should be able to successfully add a unique song', function() {
        var song = TestUtility.buildSong();
        var addedPlaylistItem = this.playlistItems._tryAddSongAtIndex(song, 0);
        expect(addedPlaylistItem).not.to.equal(null);
        expect(this.playlistItems.length).to.equal(1);
      });

      it('should gracefully fail to add a non-unique song', function() {
        var song = TestUtility.buildSong();
        this.playlistItems._tryAddSongAtIndex(song, 0);

        var addedPlaylistItem = this.playlistItems._tryAddSongAtIndex(song, 1);
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
          title: 'foo',
          cid: '123'
        };

        sinon.stub($, 'ajax').yieldsTo('success', [createdObject]);

        this.playlistItems.add({
          title: 'hello, world',
          song: TestUtility.buildSong()
        });
        this.playlistItems.at(0).cid = '123';

        this.playlistItems._bulkCreate([], {
          success: function() {
            expect(this.playlistItems.at(0).get('title')).to.equal(createdObject.title);
            $.ajax.restore();
            done();
          }.bind(this)
        });
      });
    });

    it('should be able to map a created object to an existing model', function() {
      var createdObject = {
        cid: '123',
        title: 'foo'
      };

      this.playlistItems.add({
        title: 'hello, world',
        song: TestUtility.buildSong()
      });
      this.playlistItems.at(0).cid = '123';

      this.playlistItems._mapCreatedToExisting(createdObject);
      expect(this.playlistItems.at(0).get('title')).to.equal(createdObject.title);
    });

    it('should be able to get a model by song id', function() {
      var song = TestUtility.buildSong();

      this.playlistItems.add({
        song: song,
        title: song.get('title')
      });

      var playlistItem = this.playlistItems._getBySongId(song.get('id'));
      expect(playlistItem).to.equal(this.playlistItems.at(0));
    });
  });
});