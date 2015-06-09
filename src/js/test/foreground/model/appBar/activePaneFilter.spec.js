define(function(require) {
  'use strict';

  var ActivePaneFilter = require('foreground/model/appBar/activePaneFilter');
  var SignInManager = require('background/model/signInManager');
  var User = require('background/model/user');
  var Playlists = require('background/collection/playlists');
  var ActivePlaylistManager = require('background/model/activePlaylistManager');

  describe('ActivePaneFilter', function() {
    beforeEach(function() {
      this.activePaneFilter = new ActivePaneFilter({
        signInManager: new SignInManager(),
        activePlaylistManager: new ActivePlaylistManager({
          signInManager: new SignInManager()
        })
      });
    });

    afterEach(function() {
      this.activePaneFilter.stopListening();
    });

    describe('when initializing', function() {
      it('should set isEnabled to false if no signedInUser exists', function() {
        expect(this.activePaneFilter.get('isEnabled')).to.equal(false);
      });

      it('should set isEnabled to true if signedInUser exists', function() {
        var signInManager = new SignInManager();
        signInManager.set('signedInUser', new User({
          playlists: new Playlists([{}])
        }));

        var activePaneFilter = new ActivePaneFilter({
          signInManager: signInManager,
          activePlaylistManager: new ActivePlaylistManager({
            signInManager: signInManager
          })
        });

        expect(activePaneFilter.get('isEnabled')).to.equal(true);
        activePaneFilter.stopListening();
      });
    });

    it('should call _setEnabledState when the signedInUser changes', function() {
      sinon.stub(this.activePaneFilter, '_setEnabledState');
      this.activePaneFilter._onSignInManagerChangeSignedInUser();
      expect(this.activePaneFilter._setEnabledState.calledOnce).to.equal(true);
      this.activePaneFilter._setEnabledState.restore();
    });

    describe('_setEnabledState', function() {
      it('should set isEnabled to true if signedInUser exists', function() {
        this.activePaneFilter._setEnabledState({});
        expect(this.activePaneFilter.get('isEnabled')).to.equal(true);
      });

      it('should set isEnabled to false if signedInUser does not exist', function() {
        this.activePaneFilter._setEnabledState(null);
        expect(this.activePaneFilter.get('isEnabled')).to.equal(false);
      });
    });
  });
});