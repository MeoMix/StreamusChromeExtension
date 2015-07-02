define(function(require) {
  'use strict';

  var Songs = require('background/collection/songs');
  var TestUtility = require('test/testUtility');

  describe('Songs', function() {
    beforeEach(function() {
      this.songs = new Songs();
    });

    describe('when determining total duration of songs in collection', function() {
      it('should say 0 when empty', function() {
        var totalDuration = this.songs._getTotalDuration();
        expect(totalDuration).to.equal(0);
      });

      it('should know how long a single song is in seconds', function() {
        var song = TestUtility.buildSong();
        this.songs.add(song);

        var totalDuration = this.songs._getTotalDuration();
        var songDuration = parseInt(song.get('duration'), 10);
        expect(totalDuration).to.equal(songDuration);
      });

      it('should know how long multiple songs are in seconds', function() {
        var song1 = TestUtility.buildSong();
        this.songs.add(song1);

        var song2 = TestUtility.buildSong('LpDV6uO-99k');
        this.songs.add(song2);

        var totalDuration = this.songs._getTotalDuration();
        var song1Duration = parseInt(song1.get('duration'), 10);
        var song2Duration = parseInt(song2.get('duration'), 10);
        expect(totalDuration).to.equal(parseInt(song1Duration + song2Duration));
      });
    });
  });
});