'use strict';
import PlaylistItems from 'background/collection/playlistItems';

describe('PlaylistItems', function() {
  it('Should not be able to contain duplicates by id', function() {
    var playlistItems = new PlaylistItems([], {
      playlistId: ''
    });
    expect(playlistItems.length).to.equal(0);

    var playlistItem = TestUtility.buildPlaylistItem();
    playlistItem.set('id', 123);
    var duplicatePlaylistItem = TestUtility.buildPlaylistItem();
    duplicatePlaylistItem.set('id', 123);
    duplicatePlaylistItem.get('video').set('id', '12345678910');

    var addedPlaylistItem = playlistItems.add(playlistItem);
    expect(playlistItems.length).to.equal(1);
    expect(addedPlaylistItem).not.to.equal(null);
    var addedDuplicatePlaylistItem = playlistItems.add(duplicatePlaylistItem);

    expect(playlistItems.length).to.equal(1);
    expect(addedDuplicatePlaylistItem).not.to.equal(null);
  });

  it('Should not be able to contain duplicates by videoId', function() {
    var playlistItems = new PlaylistItems([], {
      playlistId: ''
    });
    expect(playlistItems.length).to.equal(0);

    var playlistItem = TestUtility.buildPlaylistItem();
    var duplicatePlaylistItem = TestUtility.buildPlaylistItem();

    var addedPlaylistItem = playlistItems.add(playlistItem);
    expect(playlistItems.length).to.equal(1);
    expect(addedPlaylistItem).not.to.equal(null);
    var addedDuplicatePlaylistItem = playlistItems.add(duplicatePlaylistItem);
    expect(playlistItems.length).to.equal(1);
    expect(addedDuplicatePlaylistItem).not.to.equal(null);
  });
});