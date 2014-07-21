define([
    'background/model/user'
], function(User) {
    'use strict';

    //  TODO: Test when supportsGoogleLogin is false.
    describe('User', function() {
        describe('new user', function () {
            describe('when not signed into Google Chrome ', function () {
                var USER_ID = '1111-1111-1111-1111';
                var GOOGLE_PLUS_ID = '';

                before(function() {
                    sinon.stub(chrome.identity, 'getProfileUserInfo').yields({
                        id: GOOGLE_PLUS_ID,
                        email: ''
                    });

                    sinon.stub($, 'ajax').yieldsTo('success', {
                        id: USER_ID,
                        playlists: [{
                            active: false
                        }]
                    });

                    sinon.spy(User, '_promptGoogleLogin');
                    sinon.spy(User, '_promptLinkUserId');
                });

                describe('when instantiated as a new user', function() {
                    it('should be created as a new user and should prompt to consider signing into Google Chrome', function () {
                        User._clearLocalUserId();
                        User.signInWithGoogle();

                        //  Once to login, again for checking to see if should prompt to link to Google Account.
                        expect(chrome.identity.getProfileUserInfo.calledTwice).to.equal(true);
                        expect($.ajax.calledOnce).to.equal(true);
                        expect(User.get('googlePlusId')).to.equal(GOOGLE_PLUS_ID);
                        expect(User.isNew()).to.equal(false);
                        expect(User.get('id')).to.equal(USER_ID);

                        //  Since the user isn't signed into Google Chrome we should prompt them to login so their data can be persisted across PCs.
                        expect(User._promptGoogleLogin.calledOnce).to.equal(true);
                        
                        console.log("User prompt:")
                        //  Since the user isn't signed into Google Chrome, we should NOT prompt them to link their data because there's no ID to link to yet.
                        expect(User._promptLinkUserId.calledOnce).to.equal(false);
                    });
                });

                after(function () {
                    chrome.identity.getProfileUserInfo.restore();
                    $.ajax.restore();
                    User._promptGoogleLogin.restore();
                    User._promptLinkUserId.restore();
                });
            });
        });
    });
})