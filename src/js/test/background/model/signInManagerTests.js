define([
    'background/model/signInManager',
    'background/model/user'
], function (SignInManager, User) {
    'use strict';

    describe('SignInManager', function () {
        beforeEach(function () {
            this.signInManager = new SignInManager();
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

                sinon.spy(this.signInManager, '_promptGoogleSignIn');
                sinon.spy(this.signInManager, '_promptLinkUserId');
                sinon.spy(this.signInManager, '_onSignInSuccess');
            });

            afterEach(function () {
                chrome.identity.getProfileUserInfo.restore();
                $.ajax.restore();
                this.signInManager._promptGoogleSignIn.restore();
                this.signInManager._promptLinkUserId.restore();
                this.signInManager._onSignInSuccess.restore();
            });

            describe('when signing in as a new user', function () {
                it('the user should be signed in and should prompt to consider signing into Google Chrome', function () {
                    localStorage.removeItem('userId');
                    this.signInManager.signInWithGoogle();
                    ensureSignedIn(this.signInManager);
                });
            });

            describe('when signing in as an existing user', function () {
                it('the user should be signed should prompt to consider signing into Google Chrome', function () {
                    localStorage.setItem('userId', USER_ID);
                    this.signInManager.signInWithGoogle();
                    ensureSignedIn(this.signInManager);
                });
            });

            function ensureSignedIn(signInManager) {
                //  Once to login, again for checking to see if should prompt to link to Google Account.
                expect(chrome.identity.getProfileUserInfo.calledTwice).to.equal(true);
                expect(signInManager.get('signedInUser')).not.to.equal(null);
                expect(signInManager._onSignInSuccess.calledOnce).to.equal(true);
                //  Since the user isn't signed into Google Chrome we should prompt them to login so their data can be persisted across PCs.
                expect(signInManager._promptGoogleSignIn.calledOnce).to.equal(true);
                //  Since the user isn't signed into Google Chrome, we should NOT prompt them to link their data because there's no ID to link to yet.
                expect(signInManager._promptLinkUserId.calledOnce).to.equal(false);
            }
        });

        describe('when signed into Google Chrome', function () {
            var USER_ID = '1111-1111-1111-1111';
            var GOOGLE_PLUS_ID = '111111111';

            beforeEach(function () {
                sinon.stub(chrome.identity, 'getProfileUserInfo').yields({
                    id: GOOGLE_PLUS_ID,
                    email: ''
                });

                sinon.spy(this.signInManager, '_promptGoogleSignIn');
                sinon.spy(this.signInManager, '_promptLinkUserId');
            });

            afterEach(function () {
                chrome.identity.getProfileUserInfo.restore();
                $.ajax.restore();
                this.signInManager._promptGoogleSignIn.restore();
                this.signInManager._promptLinkUserId.restore();
            });

            describe('when signing in as a new user', function () {
                beforeEach(function () {
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
                });

                it('should be created as a new user and should be linked to Google Chrome account', function () {
                    localStorage.removeItem('userId');
                    this.signInManager.signInWithGoogle();
                    //  Once to login, again for checking to see if should prompt to link to Google Account.
                    expect(chrome.identity.getProfileUserInfo.calledTwice).to.equal(true);
                    //  Since the user is signed into Google Chrome we should not prompt them to login.
                    expect(this.signInManager._promptGoogleSignIn.calledOnce).to.equal(false);
                    //  Since the user is signed into Google Chrome, but their data is already linked, should not prompt them to link.
                    expect(this.signInManager._promptLinkUserId.calledOnce).to.equal(false);
                });
            });

            describe('when signing in as an existing user', function () {
                beforeEach(function () {
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
                });

                it('user data should be preserved and should prompt to consider linking account to Google Chrome', function () {
                    localStorage.setItem('userId', USER_ID);
                    this.signInManager.signInWithGoogle();

                    //  Once to login, again for checking to see if should prompt to link to Google Account.
                    expect(chrome.identity.getProfileUserInfo.calledTwice).to.equal(true);
                    //  Since the user is signed into Google Chrome we should not prompt them to login.
                    expect(this.signInManager._promptGoogleSignIn.calledOnce).to.equal(false);
                    //  Since the user is signed into Google Chrome and their data is not linked -- prompt to link the account
                    expect(this.signInManager._promptLinkUserId.calledOnce).to.equal(true);
                });
            });
        });

        describe('when data is loaded and signing into Google Chrome event has triggered', function () {
            var OLD_USER_ID = '1111-1111-1111-1111';
            var NEW_USER_ID = '2222-2222-2222-2222';
            var OLD_GOOGLE_PLUS_ID = '111111111';
            var NEW_GOOGLE_PLUS_ID = '222222222';

            beforeEach(function () {
                sinon.stub(chrome.identity, 'getProfileUserInfo').yields({
                    id: NEW_GOOGLE_PLUS_ID,
                    email: ''
                });

                sinon.spy(this.signInManager, '_promptLinkUserId');
            });

            afterEach(function () {
                chrome.identity.getProfileUserInfo.restore();
                this.signInManager._promptLinkUserId.restore();
                $.ajax.restore();
            });

            describe('when account already linked to Google', function () {
                beforeEach(function () {
                    localStorage.removeItem('userId');

                    //  Account already linked to Google:
                    this.signInManager.set('signedInUser', new User({
                        googlePlusId: OLD_GOOGLE_PLUS_ID,
                        id: OLD_USER_ID
                    }));
                });

                describe('when new user is not linked to Google', function () {
                    beforeEach(function () {
                        sinon.stub($, 'ajax')
                            //  Return false on first AJAX request to hasLinkedGoogleAccount because NEW_GOOGE_PLUS_ID isn't linked to an existing account
                            .onFirstCall().yieldsTo('success', false)
                            //  Return new user data on second AJAX request to _create because can't link to the already signed in user since they've already got an account.
                            .onSecondCall().yieldsTo('success', {
                                id: NEW_USER_ID,
                                googlePlusId: NEW_GOOGLE_PLUS_ID,
                                playlists: [{
                                    active: false
                                }]
                            });
                    });

                    //  Since the new user can't be linked to the old user's data, but the new user already has a Google+ ID, use that Google+ ID in creating their account.
                    it('should create a new account and and link that account to the new user\'s account', function () {
                        this.signInManager._onChromeIdentitySignInChanged({
                            id: NEW_GOOGLE_PLUS_ID,
                            email: ''
                        }, true);

                        //  New user's account is already linked to Google.
                        expect(this.signInManager._promptLinkUserId.calledOnce).to.equal(false);
                    });
                });

                describe('when new user is already linked to Google', function () {
                    beforeEach(function () {
                        sinon.stub($, 'ajax')
                            //  Return true on first AJAX request to hasLinkedGoogleAccount because NEW_GOOGE_PLUS_ID is linked to an existing account
                            .onFirstCall().yieldsTo('success', true)
                            //  Account is already linked to an Google ID in the DB, return user data:
                            .onSecondCall().yieldsTo('success', {
                                id: NEW_USER_ID,
                                googlePlusId: NEW_GOOGLE_PLUS_ID,
                                playlists: [{
                                    active: false
                                }]
                            });
                    });

                    it('should swap to new account - old data is preserved in DB', function () {
                        this.signInManager._onChromeIdentitySignInChanged({
                            id: NEW_GOOGLE_PLUS_ID,
                            email: ''
                        }, true);

                        //  New user's account is already linked to Google.
                        expect(this.signInManager._promptLinkUserId.calledOnce).to.equal(false);
                    });
                });
            });

            describe('when current user\'s account is not linked to Google', function () {
                beforeEach(function () {
                    localStorage.removeItem('userId');

                    //  Currently signed in user's account is not linked to Google:
                    this.signInManager.set('signedInUser', new User({
                        googlePlusId: '',
                        id: OLD_USER_ID
                    }));
                });

                describe('when new user\'s account is not linked to Google', function () {
                    beforeEach(function () {
                        sinon.stub($, 'ajax')
                            //  Return false on first AJAX request to hasLinkedGoogleAccount because NEW_GOOGE_PLUS_ID isn't linked to an existing account
                            .onFirstCall().yieldsTo('success', false);
                    });

                    it('should prompt new user to link their account to the existing account', function () {
                        this.signInManager._onChromeIdentitySignInChanged({
                            id: NEW_GOOGLE_PLUS_ID,
                            email: ''
                        }, true);

                        //  Prompt the user to confirm that the account they just signed in with is the one they want to use to link to the currently existing data.
                        expect(this.signInManager._promptLinkUserId.calledOnce).to.equal(true);
                    });

                    it('should merge new user account with existing account if both share the same GooglePlusId', function() {
                        var signedInUser = this.signInManager.get('signedInUser');

                        sinon.stub(signedInUser, 'hasLinkedGoogleAccount').yields(true);
                        sinon.stub(signedInUser, 'mergeByGooglePlusId');

                        this.signInManager.saveGooglePlusId();

                        expect(signedInUser.mergeByGooglePlusId.calledOnce).to.equal(true);

                        signedInUser.mergeByGooglePlusId.restore();
                        signedInUser.hasLinkedGoogleAccount.restore();
                    });
                    
                    it('should patch new user account with GooglePlusID if no other account shares GooglePlusId', function () {
                        var signedInUser = this.signInManager.get('signedInUser');

                        sinon.stub(signedInUser, 'hasLinkedGoogleAccount').yields(false);
                        sinon.stub(signedInUser, 'sync');

                        this.signInManager.saveGooglePlusId();

                        expect(signedInUser.sync.calledOnce).to.equal(true);
                        expect(signedInUser.sync.calledWith('patch')).to.equal(true);
                        
                        signedInUser.sync.restore();
                        signedInUser.hasLinkedGoogleAccount.restore();
                    });
                });

                describe('when new user is already linked to Google', function () {
                    beforeEach(function () {
                        sinon.stub($, 'ajax')
                            //  Return true on first AJAX request to hasLinkedGoogleAccount because NEW_GOOGE_PLUS_ID is linked to an existing account
                            .onFirstCall().yieldsTo('success', true);
                    });

                    it('should swap to new account - old data is lost', function () {
                        this.signInManager._onChromeIdentitySignInChanged({
                            id: NEW_GOOGLE_PLUS_ID,
                            email: ''
                        }, true);

                        //  Don't prompt the user to link accounts because we've just swapped to their new account, no linking necessary.
                        expect(this.signInManager._promptLinkUserId.calledOnce).to.equal(false);
                    });
                });
            });
        });

        describe('when data is loaded and signing out of Google Chrome event has triggered', function () {
            var USER_ID = '1111-1111-1111-1111';
            var GOOGLE_PLUS_ID = '111111111';

            beforeEach(function () {
                sinon.spy(this.signInManager, 'signOut');
                sinon.stub(chrome.identity, 'getProfileUserInfo').yields({
                    id: USER_ID,
                    email: ''
                });

                sinon.stub($, 'ajax');
            });

            afterEach(function () {
                this.signInManager.signOut.restore();
                chrome.identity.getProfileUserInfo.restore();
                $.ajax.restore();
            });

            describe('when account is already linked to Google', function () {
                beforeEach(function () {
                    //  Currently signed in user's account is not linked to Google:
                    this.signInManager.set('signedInUser', new User({
                        googlePlusId: GOOGLE_PLUS_ID,
                        id: USER_ID
                    }));

                    sinon.spy(this.signInManager, 'signInWithGoogle');
                });

                it('should clear the current accounts data and create a new user', function () {
                    this.signInManager._onChromeIdentitySignInChanged({
                        id: GOOGLE_PLUS_ID,
                        email: ''
                    }, false);

                    //  Sign out is called because the Google ID of the account signing out matches the signedInUser's ID
                    expect(this.signInManager.signOut.calledOnce).to.equal(true);
                    expect(this.signInManager.signInWithGoogle.calledOnce).to.equal(true);
                });

                afterEach(function () {
                    this.signInManager.signInWithGoogle.restore();
                });
            });

            describe('when account is not linked to Google', function () {
                beforeEach(function () {
                    //  Currently signed in user's account is not linked to Google:
                    this.signInManager.set('signedInUser', new User({
                        googlePlusId: '',
                        id: USER_ID
                    }));
                });

                it('should take no action against the existing account - data is preserved', function () {
                    this.signInManager._onChromeIdentitySignInChanged({
                        id: GOOGLE_PLUS_ID,
                        email: ''
                    }, false);

                    //  Sign out is not called because the Google ID of the account signing out doesn't match the signedInUser's ID (because it is unlinked)
                    expect(this.signInManager.signOut.calledOnce).to.equal(false);
                });
            });
        });
    });
});