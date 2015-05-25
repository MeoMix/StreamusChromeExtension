define(function(require) {
  'use strict';

  var PlaylistTitleView = require('foreground/view/appBar/playlistTitleView');
  var Playlist = require('background/model/playlist');
  var viewTestUtility = require('test/foreground/view/viewTestUtility');

  describe('PlaylistTitleView', function() {
    beforeEach(function() {
      this.documentFragment = document.createDocumentFragment();
      this.view = new PlaylistTitleView({
        model: new Playlist()
      });
    });

    afterEach(function() {
      this.view.destroy();
    });

    viewTestUtility.ensureBasicAssumptions.call(this);
  });
});