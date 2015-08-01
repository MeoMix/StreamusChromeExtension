define(function(require) {
  'use strict';

  var ExportPlaylist = require('foreground/model/dialog/exportPlaylist');
  var ExportPlaylistView = require('foreground/view/dialog/exportPlaylistView');
  var viewTestUtility = require('test/foreground/view/viewTestUtility');

  describe('ExportPlaylistView', function() {
    beforeEach(function() {
      this.documentFragment = document.createDocumentFragment();
      this.view = new ExportPlaylistView({
        model: new ExportPlaylist({
          playlist: TestUtility.buildPlaylist()
        })
      });
    });

    afterEach(function() {
      this.view.destroy();
    });

    viewTestUtility.ensureBasicAssumptions.call(this);
  });
});