define([
    'background/model/playlistItem',
    'test/testUtility'
], function (PlaylistItem, TestUtility) {
    'use strict';

    describe('PlaylistItem', function () {

        it('Should set its title properly when being created with a Song object', function () {
            var song = TestUtility.buildSong();

            var playlistItem = new PlaylistItem({
                song: song
            });
   
            expect(playlistItem.get('title')).toEqual(song.get('title'));
        });
        
        it('Should set its title properly when being created with raw Song data', function () {
            var song = TestUtility.getRawSong();

            var playlistItem = new PlaylistItem({
                song: song
            });

            expect(playlistItem.get('title')).toEqual(song.title);
        });

    });
});