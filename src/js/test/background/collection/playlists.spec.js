define(function(require) {
  'use strict';

  var Playlists = require('background/collection/playlists');

  describe('Playlists', function() {
    beforeEach(function() {
      this.playlists = new Playlists();
    });
  });
});