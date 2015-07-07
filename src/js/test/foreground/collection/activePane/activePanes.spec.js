define(function(require) {
  'use strict';

  var ActivePanes = require('foreground/collection/activePane/activePanes');
  var SignInManager = require('background/model/signInManager');
  var Settings = require('background/model/settings');
  var ActivePlaylistManager = require('background/model/activePlaylistManager');
  var LayoutType = require('common/enum/layoutType');
  var TestUtility = require('test/testUtility');

  describe('Panes', function() {
    beforeEach(function() {
      this.collection = new ActivePanes(null, {
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
      beforeEach(function() {
        sinon.stub(this.collection, '_addPlaylistPane');
        sinon.stub(this.collection, '_removePlaylistPane');
      });

      afterEach(function() {
        this.collection._addPlaylistPane.restore();
        this.collection._removePlaylistPane.restore();
      });

      it('should call _addPlaylistPane if an active playlist exists', function() {
        var playlist = TestUtility.buildPlaylist();
        this.collection._initializePanes(LayoutType.FullPane, playlist);
        expect(this.collection._addPlaylistPane.calledWith(playlist)).to.equal(true);
      });

      it('should not call _addPlaylistPane if an active playlist does not exist', function() {
        this.collection._initializePanes(LayoutType.FullPane, null);
        expect(this.collection._addPlaylistPane.called).to.equal(false);
      });

      it('should call _removePlaylistPane if a previously active playlist exists', function() {
        var playlist = TestUtility.buildPlaylist();
        this.collection._initializePanes(LayoutType.FullPane, null, playlist);
        expect(this.collection._removePlaylistPane.calledWith(playlist)).to.equal(true);
      });

      it('should not call _removePlaylistPane if a previously active playlist does not exist', function() {
        var playlist = TestUtility.buildPlaylist();
        this.collection._initializePanes(LayoutType.FullPane, playlist);
        expect(this.collection._removePlaylistPane.called).to.equal(false);
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

    describe('_removeStreamPane', function() {
      it('should be able to remove the stream pane', function() {
        this.collection.reset();
        this.collection._addStreamPane();
        var initialLength = this.collection.length;
        this.collection._removeStreamPane();
        expect(this.collection.length).to.equal(initialLength - 1);
      });
    });

    describe('_setStreamPaneVisibility', function() {
      beforeEach(function() {
        sinon.stub(this.collection, '_addStreamPane');
        sinon.stub(this.collection, '_removeStreamPane');
      });

      afterEach(function() {
        this.collection._addStreamPane.restore();
        this.collection._removeStreamPane.restore();
      });

      it('should call _addStreamPane if the streamPane is visible and does not already contain it', function() {
        this.collection.reset();
        this.collection._setStreamPaneVisibility(LayoutType.SplitPane, false);
        expect(this.collection._addStreamPane.called).to.equal(true);
      });

      it('should not called _addStreamPane if the streamPane is visible but is already present', function() {
        this.collection._setStreamPaneVisibility(LayoutType.SplitPane, false);
        expect(this.collection._addStreamPane.called).to.equal(false);
      });

      it('should call _removeStreamPane if the streamPane is not visible and is already present', function() {
        this.collection._setStreamPaneVisibility(LayoutType.FullPane, true);
        expect(this.collection._removeStreamPane.called).to.equal(true);
      });

      it('should not called _removeStreamPane if the streamPane is not visible and does not exist as a pane', function() {
        this.collection.reset();
        this.collection._setStreamPaneVisibility(LayoutType.FullPane, true);
        expect(this.collection._removeStreamPane.called).to.equal(false);
      });
    });
  });
});