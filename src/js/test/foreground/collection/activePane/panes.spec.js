define(function(require) {
  'use strict';

  var Panes = require('foreground/collection/activePane/panes');
  var SignInManager = require('background/model/signInManager');
  var Settings = require('background/model/settings');
  var ActivePlaylistManager = require('background/model/activePlaylistManager');
  var LayoutType = require('common/enum/layoutType');
  var TestUtility = require('test/testUtility');

  describe('Panes', function() {
    beforeEach(function() {
      this.collection = new Panes(null, {
        stream: TestUtility.buildStream(),
        settings: new Settings(),
        activePlaylistManager: new ActivePlaylistManager({
          signInManager: new SignInManager()
        })
      });
    });

    afterEach(function() {
      this.collection.stopListening();
    });

    describe('_initializePanes', function() {
      it('should call _addPlaylistPane if an active playlist exists', function() {

      });

      it('should not call _addPlaylistPane if an active playlist does not exist', function() {

      });

      it('should call _removePlaylistPane if a previously active playlist exists', function() {

      });

      it('should not call _removePlaylistPane if a previously active playlist does not exist', function() {

      });
    });

    describe('_addPlaylistPane', function() {
      it('should be able to add a playlist pane', function() {
        var initialLength = this.collection.length;
        this.collection._addPlaylistPane(TestUtility.buildPlaylist());
        expect(this.collection.length).to.equal(initialLength + 1);
      });
    });

    describe('_removePlaylistPane', function() {
      it('should be able to remove a specific playlist pane', function() {
        var playlist = TestUtility.buildPlaylist();
        this.collection._addPlaylistPane(playlist);
        var initialLength = this.collection.length;
        this.collection._removePlaylistPane(playlist);
        expect(this.collection.length).to.equal(initialLength - 1);
      });
    });

    describe('_getStreamPaneVisibility', function() {
      it('should return true if layoutType is SplitPane', function() {
        var streamPaneVisibility = this.collection._getStreamPaneVisibility(LayoutType.SplitPane, true);
        expect(streamPaneVisibility).to.equal(true);
      });

      it('should return true if layoutType is FullPane and no active playlist exists', function() {
        var streamPaneVisibility = this.collection._getStreamPaneVisibility(LayoutType.FullPane, false);
        expect(streamPaneVisibility).to.equal(true);
      });

      it('should return false if layoutType is FullPane and an active playlist exists', function() {
        var streamPaneVisibility = this.collection._getStreamPaneVisibility(LayoutType.FullPane, true);
        expect(streamPaneVisibility).to.equal(false);
      });
    });

    describe('_addStreamPane', function() {
      it('should be able to add the stream as a pane', function() {
        var initialLength = this.collection.length;
        this.collection._addStreamPane();
        expect(this.collection.length).to.equal(initialLength + 1);
      });
    });

    xdescribe('_removeStreamPane', function() {
      it('should be able to remove the stream pane', function() {

      });
    });

    xdescribe('_setStreamPaneVisibility', function() {
      it('should call addStreamPane if the streamPane is visible', function() {

      });

      it('should call removeStreamPane if the streamPane is not visible', function() {

      });
    });

    xdescribe('_hasStreamPane', function() {
      it('should return false when no stream pane exists', function() {
      });

      it('should return true when a stream pane exists', function() {
      });
    });
  });
});