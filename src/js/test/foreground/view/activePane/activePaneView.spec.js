define(function(require) {
  'use strict';

  var ActivePaneType = require('foreground/enum/activePaneType');
  var ActivePaneView = require('foreground/view/activePane/activePaneView');
  var ActivePane = require('foreground/model/activePane/activePane');
  var StreamView = require('foreground/view/stream/streamView');
  var ActivePlaylistAreaView = require('foreground/view/leftPane/activePlaylistAreaView');
  var ViewTestUtility = require('test/foreground/view/viewTestUtility');

  describe('ActivePaneView', function() {
    describe('PlaylistActivePaneView', function() {
      beforeEach(function() {
        this.documentFragment = document.createDocumentFragment();
        var stream = TestUtility.buildStream();

        this.view = new ActivePaneView({
          model: new ActivePane({
            type: ActivePaneType.Stream,
            relatedModel: stream
          }),
          streamItems: stream.get('items')
        });
      });

      afterEach(function() {
        this.view.destroy();
      });

      ViewTestUtility.ensureBasicAssumptions.call(this);

      describe('_getContentView', function() {
        it('should return a StreamView', function() {
          var contentView = this.view._getContentView();
          expect(contentView instanceof StreamView).to.equal(true);
        });
      });
    });

    describe('PlaylistActivePaneView', function() {
      beforeEach(function() {
        this.documentFragment = document.createDocumentFragment();
        var stream = TestUtility.buildStream();

        this.view = new ActivePaneView({
          model: new ActivePane({
            type: ActivePaneType.Playlist,
            relatedModel: TestUtility.buildPlaylist()
          }),
          streamItems: stream.get('items')
        });
      });

      afterEach(function() {
        this.view.destroy();
      });

      ViewTestUtility.ensureBasicAssumptions.call(this);

      describe('_getContentView', function() {
        it('should return a ActivePlaylistAreaView', function() {
          var contentView = this.view._getContentView();
          expect(contentView instanceof ActivePlaylistAreaView).to.equal(true);
        });
      });
    });
  });
});