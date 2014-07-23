define([
    'background/model/signInManager'
], function (SignInManager) {
    'use strict';

    //  TODO: Test when supportsGoogleLogin is false.
    describe('SignInManager', function () {
        beforeEach(function () {
            SignInManager.signOut();
        });

        describe('when not signed into Google Chrome ', function () {
            var USER_ID = '1111-1111-1111-1111';
            var GOOGLE_PLUS_ID = '';

            beforeEach(function () {
                sinon.stub(chrome.identity, 'getProfileUserInfo').yields({
                    id: GOOGLE_PLUS_ID,
                    email: ''
                });

                sinon.stub($, 'ajax').yieldsTo('success', {
                    id: USER_ID,
                    googlePlusId: GOOGLE_PLUS_ID,
                    playlists: [{
                        active: false
                    }]
                });

                sinon.spy(SignInManager, '_promptGoogleLogin');
                sinon.spy(SignInManager, '_promptLinkUserId');
            });

            describe('when signing in as a new user', function() {
                it('the user should be created as a new user and should prompt to consider signing into Google Chrome', function () {
                    SignInManager._clearLocalUserId();
                    SignInManager.signInWithGoogle();

                    //  Once to login, again for checking to see if should prompt to link to Google Account.
                    expect(chrome.identity.getProfileUserInfo.calledTwice).to.equal(true);
                    expect($.ajax.calledOnce).to.equal(true);
                    
                    var signedInUser = SignInManager.get('signedInUser');
                    
                    //  TODO: How can I check to see that signedInUser  _create was called?

                    expect(signedInUser.get('googlePlusId')).to.equal(GOOGLE_PLUS_ID);
                    expect(signedInUser.isNew()).to.equal(false);
                    expect(signedInUser.get('id')).to.equal(USER_ID);
                    
                    //  Since the user isn't signed into Google Chrome we should prompt them to login so their data can be persisted across PCs.
                    expect(SignInManager._promptGoogleLogin.calledOnce).to.equal(true);
                    //  Since the user isn't signed into Google Chrome, we should NOT prompt them to link their data because there's no ID to link to yet.
                    expect(SignInManager._promptLinkUserId.calledOnce).to.equal(false);
                });
            });

            describe('when signing in as an existing user', function() {
                it('the user\'s data should be preserved and should prompt to consider signing into Google Chrome', function () {
                    SignInManager._setLocalUserId(USER_ID);
                    SignInManager.signInWithGoogle();

                    //  Once to login, again for checking to see if should prompt to link to Google Account.
                    expect(chrome.identity.getProfileUserInfo.calledTwice).to.equal(true);
                    expect($.ajax.calledOnce).to.equal(true);
                    
                    var signedInUser = SignInManager.get('signedInUser');
                    //  TODO: How can I check to see that signedInUser  _loadByUserId was called?
                    expect(signedInUser.get('googlePlusId')).to.equal(GOOGLE_PLUS_ID);
                    expect(signedInUser.isNew()).to.equal(false);
                    expect(signedInUser.get('id')).to.equal(USER_ID);

                    //  Since the user isn't signed into Google Chrome we should prompt them to login so their data can be persisted across PCs.
                    expect(SignInManager._promptGoogleLogin.calledOnce).to.equal(true);
                    //  Since the user isn't signed into Google Chrome, we should NOT prompt them to link their data because there's no ID to link to yet.
                    expect(SignInManager._promptLinkUserId.calledOnce).to.equal(false);
                });
            });

            afterEach(function () {
                chrome.identity.getProfileUserInfo.restore();
                $.ajax.restore();
                SignInManager._promptGoogleLogin.restore();
                SignInManager._promptLinkUserId.restore();
            });
        });

        xdescribe('when signed into Google Chrome', function() {
            var USER_ID = '1111-1111-1111-1111';
            var GOOGLE_PLUS_ID = '111111111';
                
            describe('when instantiated as a new user', function () {
                beforeEach(function () {
                    sinon.stub(chrome.identity, 'getProfileUserInfo').yields({
                        id: GOOGLE_PLUS_ID,
                        email: ''
                    });

                    sinon.stub($, 'ajax')
                        //  Return null because instantiating a new user (doesn't exist in database when trying to find by GooglePlusId
                        .onFirstCall().yieldsTo('success', null)
                        .onSecondCall().yieldsTo('success', {
                            id: USER_ID,
                            googlePlusId: GOOGLE_PLUS_ID,
                            playlists: [{
                                active: false
                            }]
                        });

                    sinon.spy(User, '_promptGoogleLogin');
                    sinon.spy(User, '_promptLinkUserId');
                    sinon.spy(User, '_create');
                    sinon.spy(User, '_fetchByGooglePlusId');
                });

                it('should be created as a new user and should be linked to Google Chrome account', function () {
                    User._clearLocalUserId();
                    User.signInWithGoogle();

                    //  Once to login, again for checking to see if should prompt to link to Google Account.
                    expect(chrome.identity.getProfileUserInfo.calledTwice).to.equal(true);
                    //  Once for fetchByGoogleId which returns null and then again to create a new account which is tied to the Google account.
                    expect($.ajax.calledTwice).to.equal(true);
                    expect(User._fetchByGooglePlusId.calledOnce).to.equal(true);
                    expect(User._create.calledOnce).to.equal(true);
                    expect(User.get('googlePlusId')).to.equal(GOOGLE_PLUS_ID);
                    expect(User.isNew()).to.equal(false);
                    expect(User.get('id')).to.equal(USER_ID);

                    //  Since the user is signed into Google Chrome we should not prompt them to login.
                    expect(User._promptGoogleLogin.calledOnce).to.equal(false);
                    //  Since the user is signed into Google Chrome, but their data is already linked, should not prompt them to link.
                    expect(User._promptLinkUserId.calledOnce).to.equal(false);
                });
                
                afterEach(function () {
                    chrome.identity.getProfileUserInfo.restore();
                    $.ajax.restore();
                    User._promptGoogleLogin.restore();
                    User._promptLinkUserId.restore();
                    User._create.restore();
                    User._fetchByGooglePlusId.restore();
                });
            });

            describe('when instantiated as an existing user', function () {
                beforeEach(function () {
                    sinon.stub(chrome.identity, 'getProfileUserInfo').yields({
                        id: GOOGLE_PLUS_ID,
                        email: ''
                    });

                    sinon.stub($, 'ajax')
                        //  Return nothing because Google ID hasn't been linked to user yet.
                        .onFirstCall().yieldsTo('success', null)
                        //  Return the user by localStorage ID but still unlinked to Google Plus
                        .onSecondCall().yieldsTo('success', {
                            id: USER_ID,
                            googlePlusId: '',
                            playlists: [{
                                active: false
                            }]
                        });

                    sinon.spy(User, '_promptGoogleLogin');
                    sinon.spy(User, '_promptLinkUserId');
                    sinon.spy(User, '_create');
                    sinon.spy(User, '_fetchByGooglePlusId');
                    sinon.spy(User, 'tryloadByUserId');
                });

                it('user data should be preserved and should prompt to consider linking account to Google Chrome', function() {
                    User._setLocalUserId(USER_ID);
                    User.signInWithGoogle();

                    //  Once to login, again for checking to see if should prompt to link to Google Account.
                    expect(chrome.identity.getProfileUserInfo.calledTwice).to.equal(true);
                    //  Once to fetch by GooglePlusId (which fails because unlinked) and then a success through tryLoadingByUserId
                    expect($.ajax.calledTwice).to.equal(true);
                    expect(User._fetchByGooglePlusId.calledOnce).to.equal(true);
                    expect(User.tryloadByUserId.calledOnce).to.equal(true);
                    expect(User.get('googlePlusId')).to.equal('');
                    expect(User.isNew()).to.equal(false);
                    expect(User.get('id')).to.equal(USER_ID);

                    //  Since the user is signed into Google Chrome we should not prompt them to login.
                    expect(User._promptGoogleLogin.calledOnce).to.equal(false);
                    //  Since the user is signed into Google Chrome and their data is not linked -- prompt to link the account
                    expect(User._promptLinkUserId.calledOnce).to.equal(true);
                });
                
                afterEach(function () {
                    chrome.identity.getProfileUserInfo.restore();
                    $.ajax.restore();
                    User._promptGoogleLogin.restore();
                    User._promptLinkUserId.restore();
                    User._create.restore();
                    User._fetchByGooglePlusId.restore();
                    User.tryloadByUserId.restore();
                });
            });
        });

        xdescribe('when data is loaded and signing into Google Chrome event has triggered', function () {
            var OLD_USER_ID = '1111-1111-1111-1111';
            var NEW_USER_ID = '2222-2222-2222-2222';
            var OLD_GOOGLE_PLUS_ID = '111111111';
            var NEW_GOOGLE_PLUS_ID = '222222222';

            describe('when account already linked to Google', function () {
                xdescribe('when new user is not linked to Google', function () {
                    beforeEach(function () {
                        sinon.stub(chrome.identity, 'getProfileUserInfo').yields({
                            id: NEW_GOOGLE_PLUS_ID,
                            email: ''
                        });

                        sinon.stub($, 'ajax')
                            //  Return null on first AJAX request to _fetchByGooglePlusId because NEW_GOOGE_PLUS_ID isn't inked to an existing account
                            .onFirstCall().yieldsTo('success', null)
                            .onSecondCall().yieldsTo('success', {
                                id: NEW_USER_ID,
                                googlePlusId: NEW_GOOGLE_PLUS_ID,
                                playlists: [{
                                    active: false
                                }]
                            });

                        sinon.spy(User, '_create');
                        sinon.spy(User, '_fetchByGooglePlusId');
                        sinon.spy(User, '_promptLinkUserId');
                    });

                    it('should create a new account and prompt user to link account', function () {
                        User._clearLocalUserId();

                        //  Account already linked to Google:
                        User.set('googlePlusId', OLD_GOOGLE_PLUS_ID);
                        User.set('id', OLD_USER_ID);
                        
                        User._onChromeSignInChanged({
                            id: NEW_GOOGLE_PLUS_ID,
                            email: ''
                        }, true);
                        
                        expect(User._fetchByGooglePlusId.calledOnce).to.equal(true);
                        expect(User._create.calledOnce).to.equal(true);
                        expect(User.get('googlePlusId')).to.equal(NEW_GOOGLE_PLUS_ID);
                        expect(User.get('id')).to.equal(NEW_USER_ID);

                        //  New user's account is already linked to Google.
                        expect(User._promptLinkUserId.calledOnce).to.equal(false);
                    });

                    afterEach(function () {
                        chrome.identity.getProfileUserInfo.restore();
                        $.ajax.restore();
                        User._create.restore();
                        User._fetchByGooglePlusId.restore();
                        User._promptLinkUserId.restore();
                    });
                });

                xdescribe('when new user is already linked to Google', function () {
                    beforeEach(function () {
                        sinon.stub(chrome.identity, 'getProfileUserInfo').yields({
                            id: NEW_GOOGLE_PLUS_ID,
                            email: ''
                        });

                        sinon.stub($, 'ajax')
                            //  Account is already linked to an Google ID in the DB, return user data:
                            .onFirstCall().yieldsTo('success', {
                                id: NEW_USER_ID,
                                googlePlusId: NEW_GOOGLE_PLUS_ID,
                                playlists: [{
                                    active: false
                                }]
                            });

                        sinon.spy(User, '_fetchByGooglePlusId');
                        sinon.spy(User, '_promptLinkUserId');
                    });
                    
                    it('should swap to new account - old data is preserved in DB', function () {
                        User._clearLocalUserId();

                        //  Account already linked to Google:
                        User.set('googlePlusId', OLD_GOOGLE_PLUS_ID);
                        User.set('id', OLD_USER_ID);

                        User._onChromeSignInChanged({
                            id: NEW_GOOGLE_PLUS_ID,
                            email: ''
                        }, true);
                        
                        expect(User._fetchByGooglePlusId.calledOnce).to.equal(true);
                        expect(User.get('googlePlusId')).to.equal(NEW_GOOGLE_PLUS_ID);
                        expect(User.get('id')).to.equal(NEW_USER_ID);

                        //  New user's account is already linked to Google.
                        expect(User._promptLinkUserId.calledOnce).to.equal(false);
                    });

                    afterEach(function () {
                        chrome.identity.getProfileUserInfo.restore();
                        $.ajax.restore();
                        User._fetchByGooglePlusId.restore();
                        User._promptLinkUserId.restore();
                    });
                });
            });

            describe('when account not linked to Google', function() {
                describe('when new user is not linked to Google', function () {
                    beforeEach(function () {
                        sinon.stub(chrome.identity, 'getProfileUserInfo').yields({
                            id: NEW_GOOGLE_PLUS_ID,
                            email: ''
                        });

                        sinon.stub($, 'ajax')
                            //  Return null on first AJAX request to _fetchByGooglePlusId because NEW_GOOGE_PLUS_ID isn't inked to an existing account
                            .onFirstCall().yieldsTo('success', null)
                            .onSecondCall().yieldsTo('success', {
                                id: NEW_USER_ID,
                                googlePlusId: NEW_GOOGLE_PLUS_ID,
                                playlists: [{
                                    active: false
                                }]
                            });

                        sinon.spy(User, '_create');
                        sinon.spy(User, '_fetchByGooglePlusId');
                        sinon.spy(User, '_promptLinkUserId');
                    });

                    it('should prompt user to link account', function () {
                        User._clearLocalUserId();

                        //  Account is not linked to Google:
                        User.set('googlePlusId', '');
                        User.set('id', OLD_USER_ID);
                        
                        User._onChromeSignInChanged({
                            id: NEW_GOOGLE_PLUS_ID,
                            email: ''
                        }, true);

                        expect(User._fetchByGooglePlusId.calledOnce).to.equal(true);
                        expect(User.get('googlePlusId')).to.equal(NEW_GOOGLE_PLUS_ID);
                        expect(User.get('id')).to.equal(NEW_USER_ID);

                        //  New user's account is already linked to Google.
                        expect(User._promptLinkUserId.calledOnce).to.equal(false);

                    });
                    
                    afterEach(function () {
                        chrome.identity.getProfileUserInfo.restore();
                        $.ajax.restore();
                        User._fetchByGooglePlusId.restore();
                        User._promptLinkUserId.restore();
                    });
                });

                describe('when new user is already linked to Google', function() {
                    it('should swap to new account - old data is lost', function() {

                    });
                });
            });
        });

        xdescribe('when data is loaded and signing out of Google Chrome event has triggered', function() {
            describe('when account is already linked to Google', function () {
                it('should clear the current accounts data and create a new user', function() {

                });
            });

            describe('when account is not linked to Google', function () {
                it('should take no action against the existing account - data is preserved', function() {

                });
            });
        });
    });
})