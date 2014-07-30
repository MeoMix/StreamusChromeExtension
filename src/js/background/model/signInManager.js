define([
    'background/collection/playlists',
    'background/model/settings',
    'background/model/user'
], function (Playlists, Settings, User) {
    'use strict';

    //  Wait 30 seconds before allowing signing in attempts. Prevents spamming the server with sign-in requests.
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
            signedInUser: null,

            needPromptLinkUserId: false,
            needPromptGoogleSignIn: false
        },

        initialize: function () {
            this.on('change:signedIn', this._onSignedInChanged);
            this.on('change:signInFailed', this._onSignInFailedChanged);

            chrome.runtime.onMessage.addListener(this._onRuntimeMessage.bind(this));
            chrome.identity.onSignInChanged.addListener(this._onChromeSignInChanged.bind(this));
        },

        signInWithGoogle: function () {
            if (this._canSignIn()) {
                this._supportsGoogleSignIn ? this._getGoogleUserInfo() : this._signIn();
            }
        },

        signOut: function () {
            if (this.get('signedIn')) {
                Settings.set('userId', null);
                this.set('signedInUser', null);
                this.set('signedIn', false);
            }
        },

        _signIn: function (googlePlusId) {
            this.set('signingIn', true);

            var signingInUser = new User({
                googlePlusId: googlePlusId || ''
            });

            this.set('signingInUser', signingInUser);

            if (this._supportsGoogleSignIn() && !signingInUser.linkedToGoogle()) {
                this._promptGoogleSignIn(googlePlusId);
            }

            this._listenUserLoadEvents(signingInUser);

            //  If the account doesn't have a Google+ ID -- try logging in by localStorage ID.
            if (!signingInUser.linkedToGoogle()) {
                signingInUser.tryloadByUserId();
            } else {
                //  If the account does have a Google+ ID -- the account might be known to the database or it might not, check.
                signingInUser.hasLinkedGoogleAccount(function (hasLinkedGoogleAccount) {
                    //  If the account is known to the database -- load it.
                    if (hasLinkedGoogleAccount) {
                        signingInUser.loadByGooglePlusId();
                    } else {
                        //  Otherwise, consider the fact that there might be existing account data which could be lost if sign-in occurs.
                        var signedInUser = this.get('signedInUser');

                        //  If the signed in account is not linked to Google then information will be lost if the user account is loaded. So, prompt to link data instead of overwriting.
                        if (signedInUser !== null && !signedInUser.linkedToGoogle()) {
                            this._setSignedInUser(signedInUser);
                        } else {
                            //  But, if the signed in user is already linked to Google -- then it's OK to swap it out with other data because it won't be lost, just need to sign in with that account.
                            signingInUser.tryloadByUserId();
                        }
                    }
                }.bind(this));
            }
        },

        _listenUserLoadEvents: function (user) {
            this.listenToOnce(user, 'loadSuccess', this._onSignInSuccess);
            this.listenToOnce(user, 'loadError', this._onSignInError);
        },

        //  getProfileUserInfo is only supported in Chrome v37 for Win/Macs currently.
        _supportsGoogleSignIn: function () {
            return !_.isUndefined(chrome.identity.getProfileUserInfo);
        },

        _getGoogleUserInfo: function () {
            chrome.identity.getProfileUserInfo(this._onGetProfileUserInfo.bind(this));
        },

        //  https://developer.chrome.com/extensions/identity#method-getProfileUserInfo
        _onGetProfileUserInfo: function (profileUserInfo) {
            this._signIn(profileUserInfo.id);
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
            signedIn ? this._signIn(account.id) : this._onChromeSignedOut(account.id);
        },

        _onSignInSuccess: function () {
            var signingInUser = this.get('signingInUser');
            this._setSignedInUser(signingInUser);
        },

        _onSignInError: function (error) {
            this.stopListening(this.get('signingInUser'));
            this.set('signingInUser', null);

            console.error(error);
            this.set('signingIn', false);
            this.set('signInFailed', true);
        },

        _setSignedInUser: function (user) {
            this.stopListening(user);

            this.set('signedInUser', user);
            this.set('signingInUser', null);

            //  Announce that user has signedIn so managers can use it to fetch data.
            this.set('signingIn', false);
            this.set('signedIn', true);

            this._shouldLinkUserId(function (shouldLinkUserId) {
                if (shouldLinkUserId) {
                    this._promptLinkUserId();
                }
            }.bind(this));
        },

        //  When the active Chrome user signs out, check to see if it's linked to the current Streamus user.
        //  If so, unload the current Streamus user and re-create as a non-chrome user.
        _onChromeSignedOut: function (googlePlusId) {
            if (googlePlusId === this.get('signedInUser').get('googlePlusId')) {
                this.signOut();
                this.signInWithGoogle();
            }
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
            if (this._supportsGoogleSignIn()) {
                chrome.identity.getProfileUserInfo(function (profileUserInfo) {
                    var signedIn = profileUserInfo.id !== '';
                    callback(signedIn && !this.get('signedInUser').linkedToGoogle());
                }.bind(this));
            } else {
                callback(false);
            }
        },

        _promptLinkUserId: function () {
            //  Set a property indicating prompt is needed because UI might not be open when this method is ran so UI can't be shown immediately.
            this.set('needPromptLinkUserId', true);
        },

        _promptGoogleSignIn: function () {
            this.set('needPromptGoogleSignIn', true);
        },

        saveGooglePlusId: function () {
            chrome.identity.getProfileUserInfo(function (profileUserInfo) {
                if (profileUserInfo.id === '') throw new Error('saveGooglePlusId should only be called when a googlePlusId is known to exist');
                this.get('signedInUser').updateGooglePlusId(profileUserInfo.id);
            }.bind(this));
        }
    });

    //  Exposed globally so that the foreground can access the same instance through chrome.extension.getBackgroundPage()
    window.SignInManager = new SignInManager();
    return window.SignInManager;
});