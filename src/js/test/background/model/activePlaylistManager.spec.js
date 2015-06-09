define(function(require) {
  'use strict';

  var ActivePlaylistManager = require('background/model/activePlaylistManager');
  var SignInManager = require('background/model/signInManager');
  var User = require('background/model/user');
  var Playlists = require('background/collection/playlists');

  describe('ActivePlaylistManager', function() {
    beforeEach(function() {
      this.signInManager = new SignInManager();

      this.activePlaylistManager = new ActivePlaylistManager({
        signInManager: this.signInManager
      });
    });

    afterEach(function() {
      this.activePlaylistManager.stopListening();
    });

    it('should call _setActivePlaylist when the signedInUser changes', function() {
      sinon.stub(this.activePlaylistManager, '_setActivePlaylist');
      this.signInManager.set('signedInUser', new User({
        playlists: new Playlists([{}])
      }));
      expect(this.activePlaylistManager._setActivePlaylist.calledOnce).to.equal(true);
      this.activePlaylistManager._setActivePlaylist.restore();
    });

    describe('_setState', function() {
      it('should set isShowingStream to true if signedInUser does not exist', function() {
        this.activePlaylistManager._setActivePlaylist(null);
        expect(this.activePlaylistManager.get('activePlaylist')).to.equal(null);
      });

      it('should set isShowingStream to null if signedInUser exists, but does not contain an active playlist', function() {
        var signedInUser = new User({
          playlists: new Playlists([{}])
        });

        this.activePlaylistManager._setActivePlaylist(signedInUser);
        expect(this.activePlaylistManager.get('activePlaylist')).to.equal(null);
      });

      it('should set activePlaylist to a non-null value if signedInUser exists and contains an active playlist', function() {
        var signedInUser = new User({
          playlists: new Playlists([{
            active: true
          }])
        });

        this.activePlaylistManager._setActivePlaylist(signedInUser);
        expect(this.activePlaylistManager.get('activePlaylist')).to.not.equal(null);
      });
    });
  });
});