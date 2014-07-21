define([
    'background/model/user'
], function(User) {
    'use strict';

    //  TODO: Test when supportsGoogleLogin is false.
    describe('User', function() {
        beforeEach(function() {
            User.clear();
        });

        describe('when not signed into Google Chrome ', function () {
            var USER_ID = '1111-1111-1111-1111';
            var GOOGLE_PLUS_ID = '';

            beforeEach(function() {
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

                sinon.spy(User, '_promptGoogleLogin');
                sinon.spy(User, '_promptLinkUserId');
                sinon.spy(User, '_createIfNew');
                sinon.spy(User, '_fetchByUserId');
            });

            describe('when instantiated as a new user', function() {
                it('should be created as a new user and should prompt to consider signing into Google Chrome', function () {
                    User._clearLocalUserId();
                    User.signInWithGoogle();

                    //  Once to login, again for checking to see if should prompt to link to Google Account.
                    expect(chrome.identity.getProfileUserInfo.calledTwice).to.equal(true);
                    expect($.ajax.calledOnce).to.equal(true);
                    expect(User._createIfNew.calledOnce).to.equal(true);
                    expect(User.get('googlePlusId')).to.equal(GOOGLE_PLUS_ID);
                    expect(User.isNew()).to.equal(false);
                    expect(User.get('id')).to.equal(USER_ID);
                    //  Since the user isn't signed into Google Chrome we should prompt them to login so their data can be persisted across PCs.
                    expect(User._promptGoogleLogin.calledOnce).to.equal(true);
                    //  Since the user isn't signed into Google Chrome, we should NOT prompt them to link their data because there's no ID to link to yet.
                    expect(User._promptLinkUserId.calledOnce).to.equal(false);
                });
            });

            describe('when instantiated as an existing user', function() {
                it('user data should be preserved and should prompt to consider signing into Google Chrome', function () {
                    User._setLocalUserId(USER_ID);
                    User.signInWithGoogle();

                    //  Once to login, again for checking to see if should prompt to link to Google Account.
                    expect(chrome.identity.getProfileUserInfo.calledTwice).to.equal(true);
                    expect($.ajax.calledOnce).to.equal(true);
                    expect(User._fetchByUserId.calledOnce).to.equal(true);
                    expect(User.get('googlePlusId')).to.equal(GOOGLE_PLUS_ID);
                    expect(User.isNew()).to.equal(false);
                    expect(User.get('id')).to.equal(USER_ID);

                    //  Since the user isn't signed into Google Chrome we should prompt them to login so their data can be persisted across PCs.
                    expect(User._promptGoogleLogin.calledOnce).to.equal(true);
                    //  Since the user isn't signed into Google Chrome, we should NOT prompt them to link their data because there's no ID to link to yet.
                    expect(User._promptLinkUserId.calledOnce).to.equal(false);
                });
            });

            afterEach(function () {
                chrome.identity.getProfileUserInfo.restore();
                $.ajax.restore();
                User._promptGoogleLogin.restore();
                User._promptLinkUserId.restore();
                User._createIfNew.restore();
                User._fetchByUserId.restore();
            });
        });

        describe('when signed into Google Chrome', function() {
            var USER_ID = '1111-1111-1111-1111';
            var GOOGLE_PLUS_ID = '111111111';

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

                sinon.spy(User, '_promptGoogleLogin');
                sinon.spy(User, '_promptLinkUserId');
                sinon.spy(User, '_createIfNew');
                sinon.spy(User, '_fetchByGooglePlusId');
            });
                
            describe('when instantiated as a new user', function () {
                it('should be created as a new user and should be linked to Google Chrome account', function () {
                    User._clearLocalUserId();
                    User.signInWithGoogle();

                    //  Once to login, again for checking to see if should prompt to link to Google Account.
                    expect(chrome.identity.getProfileUserInfo.calledTwice).to.equal(true);
                    expect($.ajax.calledOnce).to.equal(true);
                    expect(User._createIfNew.calledOnce).to.equal(true);
                    expect(User.get('googlePlusId')).to.equal(GOOGLE_PLUS_ID);
                    expect(User.isNew()).to.equal(false);
                    expect(User.get('id')).to.equal(USER_ID);

                    //  Since the user is signed into Google Chrome we should not prompt them to login.
                    expect(User._promptGoogleLogin.calledOnce).to.equal(false);
                    //  Since the user is signed into Google Chrome, but their data is already linked, should not prompt them to link.
                    expect(User._promptLinkUserId.calledOnce).to.equal(false);
                });
            });

            describe('when instantiated as an existing user', function () {
                it('user data should be preserved and should prompt to consider signing into Google Chrome', function() {
                    User._setLocalUserId(USER_ID);
                    User.signInWithGoogle();

                    //  Once to login, again for checking to see if should prompt to link to Google Account.
                    expect(chrome.identity.getProfileUserInfo.calledTwice).to.equal(true);
                    expect($.ajax.calledOnce).to.equal(true);
                    expect(User._fetchByGooglePlusId.calledOnce).to.equal(true);
                    expect(User.get('googlePlusId')).to.equal(GOOGLE_PLUS_ID);
                    expect(User.isNew()).to.equal(false);
                    expect(User.get('id')).to.equal(USER_ID);

                    //  Since the user is signed into Google Chrome we should not prompt them to login.
                    expect(User._promptGoogleLogin.calledOnce).to.equal(false);
                    //  Since the user is signed into Google Chrome and their data is not linked -- prompt to link the account
                    expect(User._promptLinkUserId.calledOnce).to.equal(true);
                });
            });

            afterEach(function () {
                chrome.identity.getProfileUserInfo.restore();
                $.ajax.restore();
                User._promptGoogleLogin.restore();
                User._promptLinkUserId.restore();
                User._createIfNew.restore();
                User._fetchByGooglePlusId.restore();
            });
        });
    });
})