define(function(require) {
  'use strict';

  var Panes = require('foreground/collection/activePane/panes');
  var SignInManager = require('background/model/signInManager');
  var Settings = require('background/model/settings');
  var ActivePlaylistManager = require('background/model/activePlaylistManager');
  var Playlists = require('background/collection/playlists');
  var LayoutType = require('common/enum/layoutType');
  var User = require('background/model/user');
  var TestUtility = require('test/testUtility');

  describe('Panes', function() {
    beforeEach(function() {
      this.collection = new Panes(null, {
        stream: TestUtility.buildStream(),
        signInManager: new SignInManager(),
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
        sinon.stub(this.collection, '_initializePlaylistPanes');
      });

      afterEach(function() {
        this.collection._initializePlaylistPanes.restore();
      });

      it('should initialize playlist panes when a signed in user exists', function() {
        this.collection._initializePanes(new User());
        expect(this.collection._initializePlaylistPanes.calledOnce).to.equal(true);
      });

      it('should not initialize playlist panes when no signed in user exists', function() {
        this.collection._initializePanes(null);
        expect(this.collection._initializePlaylistPanes.calledOnce).to.equal(false);
      });
    });

    describe('_initializePlaylistPanes', function() {
      it('should setup playlists bindings', function() {
        sinon.stub(this.collection, '_setPlaylistsBindings');
        var user = new User({
          playlists: new Playlists()
        });
        this.collection._initializePlaylistPanes(user);
        expect(this.collection._setPlaylistsBindings.calledWith(user.get('playlists'), true)).to.equal(true);
        this.collection._setPlaylistsBindings.restore();
      });

      it('should pass the users playlists to addPlaylistPanes', function() {
        sinon.stub(this.collection, '_addPlaylistPanes');
        var user = new User({
          playlists: new Playlists()
        });
        this.collection._initializePlaylistPanes(user);
        expect(this.collection._addPlaylistPanes.calledWith(user.get('playlists'))).to.equal(true);
        this.collection._addPlaylistPanes.restore();
      });
    });

    describe('_destroyPlaylistPanes', function() {
      it('should tear down the previous playlists bindings', function() {
        sinon.stub(this.collection, '_setPlaylistsBindings');
        var user = new User({
          playlists: new Playlists()
        });
        this.collection._destroyPlaylistPanes(user);
        expect(this.collection._setPlaylistsBindings.calledWith(user.get('playlists'), false)).to.equal(true);
        this.collection._setPlaylistsBindings.restore();
      });

      it('should not tear down the previous users bindings if it does not exist', function() {
        sinon.stub(this.collection, '_setPlaylistsBindings');
        this.collection._destroyPlaylistPanes(null);
        expect(this.collection._setPlaylistsBindings.calledOnce).to.equal(false);
        this.collection._setPlaylistsBindings.restore();
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
        var firstPlaylist = TestUtility.buildPlaylist();
        var secondPlaylist = TestUtility.buildPlaylist();

        this.collection._addPlaylistPanes(new Playlists([firstPlaylist, secondPlaylist]));
        var initialLength = this.collection.length;
        this.collection._removePlaylistPane(firstPlaylist);
        expect(this.collection.length).to.equal(initialLength - 1);
      });
    });

    describe('_removeAllPlaylistPanes', function() {
      it('should be able to remove 1+ playlist panes', function() {
        this.collection._addPlaylistPanes(new Playlists([TestUtility.buildPlaylist(), TestUtility.buildPlaylist()]));
        var initialLength = this.collection.length;
        this.collection._removeAllPlaylistPanes();
        expect(this.collection.length).to.equal(initialLength - 2);
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

    describe('_setStreamPaneVisibility', function() {
      it('should not error when setting stream pane visibility', function() {
        this.collection._setStreamPaneVisibility(LayoutType.SplitPane, true);
        expect(this.collection._getStreamPane().get('isVisible')).to.equal(true);
      });
    });

    describe('_setPlaylistPaneVisibility', function() {
      it('should mark a playlist pane as visible', function() {
        var playlist = TestUtility.buildPlaylist();
        this.collection._addPlaylistPane(playlist);
        this.collection._setPlaylistPaneVisibility(playlist, true);

        var playlistPane = this.collection._getVisiblePlaylistPane();
        expect(playlistPane).not.to.equal(undefined);
        expect(playlistPane.get('relatedModel')).to.equal(playlist);
      });
    });

    describe('_tryHideVisiblePlaylistPane', function() {
      it('should hide an existing, visible playlist pane', function() {
        var playlist = TestUtility.buildPlaylist();
        playlist.set('active', true);
        this.collection._addPlaylistPane(playlist);

        this.collection._tryHideVisiblePlaylistPane();
        expect(this.collection._getVisiblePlaylistPane()).to.equal(undefined);
      });

      it('should not error when no visible playlist exists', function() {
        this.collection._tryHideVisiblePlaylistPane();
        expect(this.collection._getVisiblePlaylistPane()).to.equal(undefined);
      });
    });

    describe('_getVisiblePlaylistPane', function() {
      it('should return the visible playlist pane', function() {
        var playlist = TestUtility.buildPlaylist();
        playlist.set('active', true);
        this.collection._addPlaylistPane(playlist);

        var playlistPane = this.collection._getVisiblePlaylistPane();
        expect(playlistPane).not.to.equal(undefined);
        expect(playlistPane.get('relatedModel')).to.equal(playlist);
      });
    });

    describe('_hasPlaylistPanes', function() {
      it('should return false when there are no playlist panes', function() {
        var hasPlaylistPanes = this.collection._hasPlaylistPanes();
        expect(hasPlaylistPanes).to.equal(false);
      });

      it('should return true when there is a playlist pane', function() {
        this.collection._addPlaylistPane(TestUtility.buildPlaylist());
        var hasPlaylistPanes = this.collection._hasPlaylistPanes();
        expect(hasPlaylistPanes).to.equal(true);
      });
    });
  });
});