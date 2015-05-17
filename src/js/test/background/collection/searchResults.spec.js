define(function(require) {
    'use strict';

    var Songs = require('background/collection/songs');
    var SearchResults = require('background/collection/searchResults');
    var TestUtility = require('test/testUtility');

    describe('SearchResults', function() {
        beforeEach(function() {
            this.searchResults = new SearchResults();
        });

        it('should be able to parse a song into a search result', function() {
            var song = TestUtility.buildSong();
            var searchResult = this.searchResults._songAsSearchResult(song);

            expect(searchResult.get('title')).to.equal(song.get('title'));
            expect(searchResult.get('song')).to.equal(song);
        });

        it('should be able to parse an array of songs into an array of search results', function() {
            var songs = [TestUtility.buildSong('N92CLZlsNRw'), TestUtility.buildSong('bek1y2uiQGA')];
            var searchResults = this.searchResults._songsAsSearchResults(songs);

            expect(searchResults.length).to.equal(2);
            expect(searchResults[0].get('song')).to.equal(songs[0]);
            expect(searchResults[1].get('song')).to.equal(songs[1]);
        });

        it('should be able to parse a collection of songs into an array of search results', function() {
            var songs = new Songs([TestUtility.buildSong('N92CLZlsNRw'), TestUtility.buildSong('bek1y2uiQGA')]);
            var searchResults = this.searchResults._songsAsSearchResults(songs);

            expect(searchResults.length).to.equal(2);
            expect(searchResults[0].get('song')).to.equal(songs.at(0));
            expect(searchResults[1].get('song')).to.equal(songs.at(1));
        });

        it('should be able to parse a single song into an array of search results', function() {
            var song = TestUtility.buildSong();
            var searchResults = this.searchResults._songsAsSearchResults(song);

            expect(searchResults.length).to.equal(1);
            expect(searchResults[0].get('song')).to.equal(song);
        });

        it('should be able to add songs', function() {
            var songs = new Songs([TestUtility.buildSong('N92CLZlsNRw'), TestUtility.buildSong('bek1y2uiQGA')]);
            this.searchResults.addSongs(songs);

            expect(this.searchResults.length).to.equal(songs.length);
        });

        it('should trigger an add:completed event after adding songs', function() {
            sinon.spy(this.searchResults, 'trigger');
            var songs = new Songs([TestUtility.buildSong('N92CLZlsNRw'), TestUtility.buildSong('bek1y2uiQGA')]);
            this.searchResults.addSongs(songs);

            expect(this.searchResults.trigger.calledWith('add:completed')).to.equal(true);
            this.searchResults.trigger.restore();
        });

        it('should be able to get songs', function() {
            var songs = new Songs([TestUtility.buildSong('N92CLZlsNRw'), TestUtility.buildSong('bek1y2uiQGA')]);
            this.searchResults.addSongs(songs);

            var retrievedSongs = this.searchResults.getSongs();
            expect(retrievedSongs.length).to.equals(songs.length);
            expect(retrievedSongs[0]).to.equal(songs.at(0));
            expect(retrievedSongs[1]).to.equal(songs.at(1));
        });
    });
});