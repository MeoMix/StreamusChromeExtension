define([
    'background/model/user'
], function (User) {
    'use strict';

    //  Wait 30 seconds before allowing signing in attempts. Prevents spamming the server with sign-in requests.
    var SIGN_IN_FAILURE_WAIT_TIME = 30;

    var SignInManager = Backbone.Model.extend({
        defaults: {
            signingIn: false,
            signInFailed: false,
            signInRetryTimer: SIGN_IN_FAILURE_WAIT_TIME,
            signInRetryTimerInterval: null,

            //  When chrome.identity.onSignInChanged runs with signedIn: true -- need to store the user who is about to be signed in momentarily.
            signingInUser: null,
            signedInUser: null,

            needPromptLinkUserId: false,
            needPromptGoogleSignIn: false,
            
            playlists: null
        },

        initialize: function () {
            this.on('change:signedInUser', this._onSignedInUserChanged);
            this.on('change:signInFailed', this._onSignInFailedChanged);
            this.listenTo(Streamus.channels.foreground.vent, 'started', this._onForegroundStarted);

            chrome.runtime.onMessage.addListener(this._onRuntimeMessage.bind(this));
            chrome.identity.onSignInChanged.addListener(this._onChromeSignInChanged.bind(this));
        },

        signInWithGoogle: function () {
            if (this._canSignIn()) {
                this._supportsGoogleSignIn() ? this._getGoogleUserInfo() : this._signIn();
            }
        },

        signOut: function () {
            if (this.get('signedInUser') !== null) {
                localStorage.removeItem('userId');
                this.set('signedInUser', null);
            }
        },
        
        saveGooglePlusId: function () {
            chrome.identity.getProfileUserInfo(function (profileUserInfo) {
                if (profileUserInfo.id === '') throw new Error('saveGooglePlusId should only be called when a googlePlusId is known to exist');

                var signedInUser = this.get('signedInUser');
                signedInUser.set('googlePlusId', profileUserInfo.id);

                signedInUser.hasLinkedGoogleAccount(function (hasLinkedGoogleAccount) {
                    //  If the account is already know to the database -- merge this account with it and then load existing account w/ merged data.
                    if (hasLinkedGoogleAccount) {
                        signedInUser.mergeByGooglePlusId();
                    } else {
                        //  Otherwise, no account -- safe to patch in a save and use this account as the main one.
                        signedInUser.save({ googlePlusId: profileUserInfo.id }, { patch: true });
                    }
                }.bind(this));
            }.bind(this));
            
            this.set('needPromptLinkUserId', false);
        },

        _signIn: function (googlePlusId) {
            this.set('signingIn', true);

            var signingInUser = new User({
                globalPlaylists: this.get('playlists'),
                googlePlusId: googlePlusId || ''
            });

            this.set('signingInUser', signingInUser);

            if (this._supportsGoogleSignIn() && !signingInUser.linkedToGoogle()) {
                this._promptGoogleSignIn(googlePlusId);
            } else {
                //  If the user signs out and then signs back in without restarting Streamus then shouldn't promtp them to sign in.
                this.set('needPromptGoogleSignIn', false);
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
            //  chrome.identity.getProfileUserInfo is defined in Opera, but throws an error if called. I've reported the issue to them.
            var isOpera = navigator.userAgent.indexOf(' OPR/') >= 0;
            return !_.isUndefined(chrome.identity.getProfileUserInfo) && !isOpera;
        },

        _getGoogleUserInfo: function () {
            chrome.identity.getProfileUserInfo(this._onGetProfileUserInfo.bind(this));
        },

        //  https://developer.chrome.com/extensions/identity#method-getProfileUserInfo
        _onGetProfileUserInfo: function (profileUserInfo) {
            this._signIn(profileUserInfo.id);
        },

        _onSignedInUserChanged: function (model, signedInUser) {
            //  Send a message to open YouTube tabs that Streamus has signed in and their HTML needs to update.
            Streamus.channels.tab.commands.trigger('notify:youTube', {
                event: signedInUser !== null ? 'signed-in' : 'signed-out'
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
            var canSignIn = this.get('signedInUser') === null && !this.get('signingIn') && !this.get('signInFailed');
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
            var sendAsynchronousResponse = false;

            switch (request.method) {
                case 'getSignedInState':
                    sendResponse({
                        signedIn: this.get('signedInUser') !== null
                    });
                    break;
                case 'signIn':
                    this.signInWithGoogle();
                    break;
                case 'addPlaylistByShareData':
                    if (this._canSignIn()) {
                        //  TODO: What if sign in fails?
                        this.once('change:signedInUser', function () {
                            this._handleAddSharedPlaylistRequest(request, sendResponse);
                        });

                        this.signInWithGoogle();
                    } else {
                        this._handleAddSharedPlaylistRequest(request, sendResponse);
                    }

                    sendAsynchronousResponse = true;
                    break;
            }
            
            //  sendResponse becomes invalid when the event listener returns, unless you return true from the event listener to indicate you wish to send a response asynchronously (this will keep the message channel open to the other end until sendResponse is called).
            return sendAsynchronousResponse;
        },

        _handleAddSharedPlaylistRequest: function (request, sendResponse) {
            //  TODO: Probably go through signedInUser here
            this.get('playlists').addPlaylistByShareData({
                shortId: request.shareCodeShortId,
                urlFriendlyEntityTitle: request.urlFriendlyEntityTitle,
                success: function (playlist) {
                    sendResponse({
                        result: 'success',
                        playlistTitle: playlist.get('title')
                    });
                },
                error: function (error) {
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
                    var signedInToChrome = profileUserInfo.id !== '';
                    var accountLinked = this.get('signedInUser').linkedToGoogle();
                    callback(signedInToChrome && !accountLinked);
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
        
        //  TODO: I think my server can probably handle signing in automatically ever since indexing was fixed.
        //  Automatically sign the user in once they've actually interacted with Streamus.
        //  Don't sign in when the background loads because people who don't use Streamus, but have it installed, will bog down the server.
        _onForegroundStarted: function() {
            this.signInWithGoogle();
        }
    });

    return SignInManager;
});