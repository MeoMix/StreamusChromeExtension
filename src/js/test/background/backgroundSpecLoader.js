define(function(require) {
  'use strict';

  // /collection/
  require('test/background/collection/clientErrors.spec');
  require('test/background/collection/playlistItems.spec');
  require('test/background/collection/searchResults.spec');

  // /model/
  require('test/background/model/clientErrorManager.spec');
  require('test/background/model/dataSource.spec');
  require('test/background/model/playlistItem.spec');
  require('test/background/model/playlistItems.spec');
  require('test/background/model/relatedSongsManager.spec');
  require('test/background/model/signInManager.spec');
  require('test/background/model/user.spec');
  require('test/background/model/youTubeV3API.spec');
});