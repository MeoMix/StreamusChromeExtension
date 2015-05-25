define(function(require) {
  'use strict';

  var User = require('background/model/user');

  describe('User', function() {
    var USER_ID = '1111-1111-1111-1111';
    var GOOGLE_PLUS_ID = '';

    beforeEach(function() {
      this.user = new User();
    });

    function ensureUserState(user) {
      expect(user.get('googlePlusId')).to.equal(GOOGLE_PLUS_ID);
      expect(user.get('id')).to.equal(USER_ID);
    }

    describe('when trying to load by user id', function() {
      beforeEach(function() {
        sinon.spy(this.user, '_create');
        sinon.spy(this.user, '_loadByUserId');
      });

      it('should use _create if no user id is in localStorage', function() {
        sinon.stub($, 'ajax').yieldsTo('success', {
          id: USER_ID,
          googlePlusId: GOOGLE_PLUS_ID,
          playlists: [{
            active: false
          }]
        });

        localStorage.removeItem('userId');
        this.user.tryloadByUserId();

        expect(this.user._create.calledOnce).to.equal(true);
        expect($.ajax.calledOnce).to.equal(true);
        ensureUserState.call(this, this.user);
      });

      it('should use _loadByUserId if an id is in localStorage and not update language if already current', function() {
        sinon.stub($, 'ajax').yieldsTo('success', {
          id: USER_ID,
          googlePlusId: GOOGLE_PLUS_ID,
          language: chrome.i18n.getUILanguage(),
          playlists: [{
            active: false
          }]
        });

        localStorage.setItem('userId', USER_ID);
        this.user.tryloadByUserId();
        expect(this.user._loadByUserId.calledOnce).to.equal(true);
        // AJAX will be called twice if there's no language set.
        expect($.ajax.calledOnce).to.equal(true);
        ensureUserState.call(this, this.user);
      });

      it('should _loadByUserId if an id is in localStorage and update language if unknown', function() {
        sinon.stub($, 'ajax').yieldsTo('success', {
          id: USER_ID,
          googlePlusId: GOOGLE_PLUS_ID,
          playlists: [{
            active: false
          }]
        });

        localStorage.setItem('userId', USER_ID);
        this.user.tryloadByUserId();
        expect(this.user._loadByUserId.calledOnce).to.equal(true);
        // AJAX will be called twice if there's no language set.
        expect($.ajax.calledTwice).to.equal(true);
        ensureUserState.call(this, this.user);
      });

      afterEach(function() {
        $.ajax.restore();
        this.user._create.restore();
        this.user._loadByUserId.restore();
      });
    });

    describe('when trying to load by Google Plus id', function() {
      describe('when Google ID does exists in database', function() {
        beforeEach(function() {
          sinon.stub($, 'ajax')
                        .onFirstCall().yieldsTo('success', {
                          id: USER_ID,
                          googlePlusId: GOOGLE_PLUS_ID,
                          language: chrome.i18n.getUILanguage(),
                          playlists: [{
                            active: false
                          }]
                        });

          sinon.spy(this.user, '_onLoadSuccess');
        });

        it('should fetch the user from the database by GooglePlus ID', function() {
          localStorage.removeItem('userId');
          this.user.loadByGooglePlusId();
          // Once for fetchByGoogleId which returns null and then again to create a new account which is tied to the Google account.
          expect($.ajax.calledOnce).to.equal(true);
          expect(this.user._onLoadSuccess.calledOnce).to.equal(true);
          ensureUserState.call(this, this.user);
        });

        afterEach(function() {
          $.ajax.restore();
          this.user._onLoadSuccess.restore();
        });
      });
    });
  });
});