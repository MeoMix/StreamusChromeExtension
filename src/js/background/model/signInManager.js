define([
    'background/collection/playlists',
    'background/model/settings',
    'background/model/user'
], function(Playlists, Settings, User) {
    'use strict';

    //  Wait 30 seconds before allowing signing in attempts. Prevents spamming the server with login requests.
    var SIGN_IN_FAILURE_WAIT_TIME = 30;
    
    var SignInManager = Backbone.Model.extend({
        defaults: {
            signingIn: false,
            signInFailed: false,
            signInRetryTimer: SIGN_IN_FAILURE_WAIT_TIME,
            signInRetryTimerInterval: null,
            signedIn: false,
            
            //  When chrome.identity.onSignInChanged runs with signedIn: true -- need to store the user who is about to be signed in momentarily.
            signingInUser: null,
            signedInUser: null
        },
        
        initialize: function() {
            this.on('change:signedIn', this._onSignedInChanged);
            this.on('change:signInFailed', this._onSignInFailedChanged);
            
            chrome.runtime.onMessage.addListener(this._onRuntimeMessage.bind(this));
            chrome.identity.onSignInChanged.addListener(this._onChromeSignInChanged);
        },
        
        signInWithGoogle: function () {
            console.log("Can sign in?", this._canSignIn());
            if (!this._canSignIn()) return;

            console.log("Signing in with Google");

            //  TODO: Shouldn't signedIn always be false here? Not sure.
            this.set('signedIn', false);
            this.set('signingIn', true);

            this._supportsGoogleLogin ? this._getGoogleUserInfo() : this._signIn();
        },
        
        signOut: function () {
            if (this.get('signedIn')) {
                this.set('signedInUser', false);
                this.set('signedIn', false);
            }
        },
        
        _signIn: function (googlePlusId) {
            var signingInUser = new User({
                googlePlusId: googlePlusId || ''
            });

            console.log("signingInUser:", signingInUser, this.get('signingInUser'));

            this.set('signingInUser', signingInUser);

            if (this._supportsGoogleLogin() && googlePlusId === '') {
                this._promptGoogleLogin(googlePlusId);
            }

            console.log("googlePlusId:", googlePlusId);
            
            this.listenToOnce(signingInUser, 'loadSuccess', this._onSignInSuccess);
            this.listenToOnce(signingInUser, 'loadError', this._onSignInError);

            //  TODO: Probably rename to tryLoadByGooglePlusId
            googlePlusId === '' ? signingInUser.tryloadByUserId() : signingInUser.loadByGooglePlusId(googlePlusId);
        },
        
        //  getProfileUserInfo is only supported in Chrome v37 for Win/Macs currently.
        _supportsGoogleLogin: function () {
            return !_.isUndefined(chrome.identity.getProfileUserInfo);
        },

        _getGoogleUserInfo: function() {
            chrome.identity.getProfileUserInfo(this._onGetProfileUserInfo.bind(this));
        },
        
        //  https://developer.chrome.com/extensions/identity#method-getProfileUserInfo
        _onGetProfileUserInfo: function (profileUserInfo) {
            this._signIn(profileUserInfo.id);
        },

        _promptGoogleLogin: function () {
            //  TODO: Notify user that they should sign in to Google Chrome to allow syncing of their playlists across multiple PCs and to ensure their data isn't lost.
            //  TODO: Make sure this notification has a 'don't remind me again' prompt.
            console.log("Prompt user that they should sign into Google");
        },
        
        _onSignedInChanged: function (model, signedIn) {
            this._notifyYouTubeTabsSignedIn(signedIn);
        },
        
        //  Send a message to open YouTube tabs that Streamus has signed in and their HTML needs to update.
        _notifyYouTubeTabsSignedIn: function (signedIn) {
            //  This is sufficient to message all tabs as well as popped-out windows which aren't tabs.
            chrome.tabs.query({ url: '*://*.youtube.com/watch?v*' }, function (tabs) {
                _.each(tabs, function (tab) {
                    chrome.tabs.sendMessage(tab.id, {
                        event: signedIn ? 'signed-in' : 'signed-out'
                    });
                });
            });
        },
        
        _onSignInFailedChanged: function (model, signInFailed) {
            if (signInFailed) {
                this._onSignInFailed();
            }
        },
        
        _onSignInFailed: function () {
            clearInterval(this.get('signInRetryInterval'));
            this.set('signInRetryInterval', setInterval(this._doSignInRetryTimerIntervalTick.bind(this), 1000));
        },

        _doSignInRetryTimerIntervalTick: function () {
            var signInRetryTimer = this.get('signInRetryTimer');
            this.set('signInRetryTimer', signInRetryTimer - 1);

            if (signInRetryTimer === 1) {
                this._resetSignInRetryTimer();
            }
        },
        
        _resetSignInRetryTimer: function () {
            clearInterval(this.get('signInRetryInterval'));
            this.set('signInRetryTimer', SIGN_IN_FAILURE_WAIT_TIME);
            this.set('signInFailed', false);
        },
        
        _canSignIn: function () {
            //  Signing in is only allowed if no user is currently signed in, not in the process of being signed in and if not waiting for signInFailure timer.
            var canSignIn = !this.get('signedIn') && !this.get('signingIn') && !this.get('signInFailed');
            return canSignIn;
        },
        
        //  https://developer.chrome.com/extensions/identity#event-onSignInChanged
        _onChromeSignInChanged: function (account, signedIn) {
            console.log("account/signedIn", account, signedIn);
            signedIn ? this._onChromeSignedIn(account.id) : this._onChromeSignedOut(account.id);
        },
        
        //  When the active Chrome user signs in, check to see if the signed in user ID is known to the Streamus DB
        //  If the user ID is known -- discard any loaded information and reload with that user ID. If it is not known,
        //  then prompt the user to link their current localStorage ID to the Google ID.
        _onChromeSignedIn: function (googlePlusId) {
            var signingInUser = new User({
                googlePlusId: googlePlusId
            });

            this.set('signingInUser', signingInUser);

            this.listenToOnce(signingInUser, 'loadSuccess', this._onSignInSuccess);
            this.listenToOnce(signingInUser, 'loadError', this._onSignInError);

            signingInUser.loadByGooglePlusId();
        },
        
        _onSignInSuccess: function () {
            var signingInUser = this.get('signingInUser');

            this.stopListening(signingInUser);

            this.set('signedInUser', signingInUser);
            this.set('signingInUser', null);

            //  Announce that user has signedIn so managers can use it to fetch data.
            this.set('signingIn', false);
            this.set('signedIn', true);

            this._shouldLinkUserId(function (shouldLinkUserId) {
                console.log("Should link:", shouldLinkUserId);
                if (shouldLinkUserId) {
                    this._promptLinkUserId();
                }
            }.bind(this));
        },
        
        _onSignInError: function(error) {
            this.stopListening(this.get('signingInUser'));
            this.set('signingInUser', null);
            
            console.error(error);
            this.set('signingIn', false);
            this.set('signInFailed', true);
        },

        //  When the active Chrome user signs out, check to see if it's linked to the current Streamus user.
        //  If so, unload the current Streamus user and re-create as a non-chrome user.
        _onChromeSignedOut: function (googlePlusId) {
            if (googlePlusId === this.get('signedInUser').get('googlePlusId')) {
                //this.clear({ silent: true });
                //  TODO: Necessary still? Probably, but doesn't feel right to do it like this..
                this._clearLocalUserId();
                this.signInWithGoogle();
            }
        },
        
        _clearLocalUserId: function () {
            Settings.set('userId', null);
        },
        
        //  TODO: This is only used for testing. Not sure how I feel about its existence. 
        _setLocalUserId: function (userId) {
            Settings.set('userId', userId);
        },
        
        _onRuntimeMessage: function (request, sender, sendResponse) {
            switch (request.method) {
                case 'getSignedInState':
                    sendResponse({
                        signedIn: this.get('signedIn')
                    });
                    break;
                case 'signIn':
                    this.signInWithGoogle();
                    break;
                case 'addPlaylistByShareData':
                    if (this.canSignIn()) {
                        this.once('change:signedIn', function () {
                            this._handleAddSharedPlaylistRequest(request, sendResponse);
                        });

                        this.signInWithGoogle();
                    } else {
                        this._handleAddSharedPlaylistRequest(request, sendResponse);
                    }
                    break;
            }
        },
        
        _handleAddSharedPlaylistRequest: function (request, sendResponse) {
            //  TODO: Probably go through signedInUser here
            Playlists.addPlaylistByShareData({
                shortId: request.shareCodeShortId,
                urlFriendlyEntityTitle: request.urlFriendlyEntityTitle,
                success: function (playlist) {
                    sendResponse({
                        result: 'success',
                        playlistTitle: playlist.get('title')
                    });
                },
                error: function () {
                    sendResponse({
                        result: 'error',
                        error: error
                    });
                }
            });
        },
        
        _shouldLinkUserId: function (callback) {
            if (this._supportsGoogleLogin()) {
                chrome.identity.getProfileUserInfo(function (profileUserInfo) {
                    var signedIn = profileUserInfo.id !== '';

                    console.log("Signed in?", signedIn, this.get('googlePlusId'));

                    callback(signedIn && this.get('signedInUser').get('googlePlusId') === '');
                }.bind(this));
            } else {
                callback(false);
            }
        },
        
        _promptLinkUserId: function () {
            //  TODO: Prompt the user that they should synchronize their current account!
            console.log('Hey user! You should probably link your user account to your Chrome Account');
            //  _saveGooglePlusId
        },
        
        //  TODO: This is only called once the user has indicated they want to link their ID.
        //_saveGooglePlusId: function() {
        //    chrome.identity.getProfileUserInfo(function (profileUserInfo) {
        //        if (profileUserInfo.id === '') throw new Error('_saveGooglePlusId should only be called when a googlePlusId is known to exist');
        //        this.get('signedInUser).updateGooglePlusId(profileUserInfo.id);
        //    }.bind(this));
        //}
    });

    //  Exposed globally so that the foreground can access the same instance through chrome.extension.getBackgroundPage()
    window.SignInManager = new SignInManager();
    return window.SignInManager;
})