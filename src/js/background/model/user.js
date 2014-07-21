//  A singleton representing the sole logged on user for the program.
//  Tries to load itself by ID stored in localStorage and then by chrome.storage.sync.
//  If still unloaded, tells the server to create a new user and assumes that identiy.
define([
    'background/collection/playlists',
    'background/model/settings'
], function (Playlists, Settings) {
    'use strict';

    //  Wait 30 seconds before allowing user to attempt signing in again. Prevent spamming the server with login requests.
    var SIGN_IN_FAILURE_WAIT_TIME = 30;

    //  User data will be loaded either from cache or server.
    var User = Backbone.Model.extend({
        defaults: function() {
            return {
                id: null,
                googlePlusId: '',
                dirty: false,
                signingIn: false,
                signInFailed: false,
                signInRetryTimer: SIGN_IN_FAILURE_WAIT_TIME,
                signInRetryTimerInterval: null,
                signedIn: false,
                playlists: null
            };
        },
        
        urlRoot: Settings.get('serverURL') + 'User/',

        initialize: function () {
            this.on('change:signedIn', this._onSignedInChanged);
            this.on('change:signInFailed', this._onSignInFailedChanged);
            chrome.runtime.onMessage.addListener(this._onRuntimeMessage.bind(this));
            chrome.identity.onSignInChanged.addListener(this._onChromeSignInChanged);
        },
        
        signInWithGoogle: function () {
            if (!this.canSignIn()) return;

            //  TODO: Shouldn't signedIn always be false here? Not sure.
            this.set('signedIn', false);
            this.set('signingIn', true);

            this._supportsGoogleLogin ? this._getGoogleUserInfo() : this._signIn();
        },
        
        _getGoogleUserInfo: function() {
            chrome.identity.getProfileUserInfo(this._onGetProfileUserInfo.bind(this));
        },
        
        //  https://developer.chrome.com/extensions/identity#event-onSignInChanged
        _onChromeSignInChanged: function(account, signedIn) {
            console.log("account/signedIn", account, signedIn);
            signedIn ? this._onChromeSignedIn(account.id) : this._onChromeSignedOut(account.id);
        },
        
        //  When the active Chrome user signs in, check to see if the signed in user ID is known to the Streamus DB
        //  If the user ID is known -- discard any loaded information and reload with that user ID. If it is not known,
        //  then prompt the user to link their current localStorage ID to the Google ID.
        _onChromeSignedIn: function (googlePlusId) {
            this._fetchByGooglePlusId(googlePlusId);
        },
        
        //  When the active Chrome user signs out, check to see if it's linked to the current Streamus user.
        //  If so, unload the current Streamus user and re-create as a non-chrome user.
        _onChromeSignedOut: function (googlePlusId) {
            if (googlePlusId === this.get('googlePlusId')) {
                this.clear({ silent: true });
                this._clearLocalUserId();
                this.signInWithGoogle();
            }
        },
        
        _saveGooglePlusId: function() {
            chrome.identity.getProfileUserInfo(function (profileUserInfo) {
                if (profileUserInfo.id === '') throw new Error('_saveGooglePlusId should only be called when a googlePlusId is known to exist');
                this.set('googlePlusId', profileUserInfo.id);

                this._updateGooglePlusId();
            }.bind(this));
        },
        
        //  getProfileUserInfo is only supported in Chrome v37 for Win/Macs currently.
        _supportsGoogleLogin: function() {
            return !_.isUndefined(chrome.identity.getProfileUserInfo);
        },
        
        //  https://developer.chrome.com/extensions/identity#method-getProfileUserInfo
        _onGetProfileUserInfo: function (profileUserInfo) {
            console.log('hi');
            this.set('googlePlusId', profileUserInfo.id);
            console.log("Signing in!", profileUserInfo);
            this._signIn();
        },
        
        _promptGoogleLogin: function() {
            //  TODO: Notify user that they should sign in to Google Chrome to allow syncing of their playlists across multiple PCs and to ensure their data isn't lost.
            //  TODO: Make sure this notification has a 'don't remind me again' prompt.
            console.log("Prompt user that they should sign into Google");
        },
        
        _signIn: function () {
            console.log("Signing in");
            var googlePlusId = this.get('googlePlusId');
            
            if (googlePlusId === '' && this._supportsGoogleLogin()) {
                this._promptGoogleLogin(googlePlusId);
            }

            googlePlusId === '' ? this._tryLoadingByUserId() : this._fetchByGooglePlusId(googlePlusId);
        },
        
        _tryLoadingByUserId: function() {
            var userId = this._getLocalUserId();
            userId === null ? this._createIfNew() : this._fetchByUserId(userId);
        },
        
        _getLocalUserId: function() {
            return Settings.get('userId');
        },
        
        _clearLocalUserId: function () {
            Settings.set('userId', null);
        },
        
        //  No stored ID found at any client storage spot. Create a new user and use the returned user object.
        //  Only run this logic is the user hasn't been created. Otherwise, no-op.
        _createIfNew: function () {
            if (this.isNew()) {
                this.save({}, {
                    success: this._onSignInSuccess.bind(this),
                    error: this._onSignInError.bind(this)
                });
            }
        },
        
        //  Loads user data by ID from the server, writes the ID to client-side storage locations
        //  for future loading and then announces that the user has been signedIn.
        _fetchByUserId: function (userId) {
            this.set('id', userId);

            this.fetch({
                success: this._onSignInSuccess.bind(this),
                error: this._onSignInError.bind(this)
            });
        },
        
        _onSignInSuccess: function () {
            this._setPlaylists();

            //  Announce that user has signedIn so managers can use it to fetch data.
            this.set('signingIn', false);
            this.set('signedIn', true);
            Settings.set('userId', this.get('id'));

            this._shouldLinkUserId(function (shouldLinkUserId) {
                if (shouldLinkUserId) {
                    this._promptLinkUserId();
                }
            }.bind(this));
        },
        
        _promptLinkUserId: function() {
            //  TODO: Prompt the user that they should synchronize their current account!
            console.log('Hey user! You should probably link your user account to your Chrome Account');
        },
        
        _shouldLinkUserId: function (callback) {
            if (this._supportsGoogleLogin()) {
                chrome.identity.getProfileUserInfo(function (profileUserInfo) {
                    var signedIn = profileUserInfo.id !== '';

                    callback(signedIn && this.get('googlePlusId') === '');
                }.bind(this));
            } else {
                callback(false);
            }
        },
        
        _onSignInError: function (error) {
            console.error(error);
            this.set('signingIn', false);
            this.set('signInFailed', true);
        },
        
        _onSignedInChanged: function(model, signedIn) {
            this.notifyYouTubeTabsSignedIn(signedIn);
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
        
        _onRuntimeMessage: function(request, sender, sendResponse) {
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
                    this.addPlaylistByShareData({
                        shortId: request.shareCodeShortId,
                        urlFriendlyEntityTitle: request.urlFriendlyEntityTitle,
                        success: function(playlist) {
                            sendResponse({
                                result: 'success',
                                playlistTitle: playlist.get('title')
                            });
                        },
                        error: function(error) {
                            sendResponse({
                                result: 'error',
                                error: error
                            });
                        }
                    });
                    break;
            }
        },
        
        //  Send a message to open YouTube tabs that Streamus has signed in and their HTML needs to update.
        notifyYouTubeTabsSignedIn: function (signedIn) {
            //  This is sufficient to message all tabs as well as popped-out windows which aren't tabs.
            chrome.tabs.query({ url: '*://*.youtube.com/watch?v*' }, function (tabs) {
                _.each(tabs, function (tab) {
                    chrome.tabs.sendMessage(tab.id, {
                        event: signedIn ? 'signed-in': 'signed-out'
                    });
                });
            });
        },
        
        canSignIn: function () {
            //  User can only sign in if they're not signed in, not in the process of being signed in and if they're not waiting for signInFailure timer.
            var canSignIn = !this.get('signedIn') && !this.get('signingIn') && !this.get('signInFailed');

            return canSignIn;
        },

        //  Expects options: { shortId, urlFriendlyEntityTitle, success, error };
        addPlaylistByShareData: function (options) {
            if (this.canSignIn()) {
                this.listenToOnce(this, 'change:signedIn', function() {
                    this.addPlaylistByShareData(options);
                });

                this.signInWithGoogle();
            } else {
                $.ajax({
                    type: 'POST',
                    url: Settings.get('serverURL') + 'Playlist/CreateCopyByShareCode',
                    data: {
                        shortId: options.shortId,
                        urlFriendlyEntityTitle: options.urlFriendlyEntityTitle,
                        userId: this.get('id')
                    },
                    success: function (playlistDto) {
                        //  Add and convert back from JSON to Backbone object.
                        var playlist = Playlists.add(playlistDto);
                        options.success(playlist);
                    }.bind(this),
                    error: function (error) {
                        console.error("Error adding playlist by share data", error);
                        options.error();
                    }
                });
            }
        },
        
        //  Set a global Playlists with the user's playlists for ease of use in getting user's playlists later.
        _setPlaylists: function () {
            console.log("Setting playlists", this);
            Playlists.reset(this.get('playlists'));
            Playlists.setUserId(this.get('id'));

            if (_.isUndefined(Playlists.getActivePlaylist())) {
                Playlists.at(0).set('active', true);
            }
        },

        _updateGooglePlusId: function() {
            $.ajax({
                url: Settings.get('serverURL') + 'User/UpdateGooglePlusId',
                type: 'PATCH',
                data: {
                    userId: this.get('id'),
                    googlePlusId: this.get('googlePlusId')
                }
            });
        },
        
        _fetchByGooglePlusId: function (googlePlusId) {
            $.ajax({
                url: Settings.get('serverURL') + 'User/GetByGooglePlusId',
                contentType: 'application/json; charset=utf-8',
                data: {
                    googlePlusId: googlePlusId
                },
                success: function (userDto) {
                    if (userDto === null) {
                        this._tryLoadingByUserId();
                    } else {
                        this.set(userDto);
                        this._onSignInSuccess();
                    }
                }.bind(this),
                error: this._onSignInError.bind(this)
            });
        }
    });

    //  Exposed globally so that the foreground can access the same instance through chrome.extension.getBackgroundPage()
    window.User = new User();
    return window.User;
});