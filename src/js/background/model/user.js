//  A singleton representing the sole logged on user for the program.
//  Tries to load itself by ID stored in localStorage and then by chrome.storage.sync.
//  If still unloaded, tells the server to create a new user and assumes that identiy.
define([
    'background/collection/playlists',
    'background/model/settings'
], function (Playlists, Settings) {
    'use strict';

    //  User data will be loaded either from cache or server.
    var User = Backbone.Model.extend({
        defaults: function() {
            return {
                id: null,
                googlePlusId: '',
                dirty: false,
                signingIn: false,
                signInFailed: false,
                signInRetryTimer: 30,
                signInRetryTimerInterval: null,
                signedIn: false,
                playlists: null
            };
        },
        
        urlRoot: Settings.get('serverURL') + 'User/',

        initialize: function () {
            //console.log('chrome.identity', chrome.identity.getProfileUserInfo(function(a) { console.log('a', a) }));
            this.on('change:signedIn', this._onSignedInChanged);
            this.on('change:signInFailed', this._onSignInFailedChanged);
            chrome.runtime.onMessage.addListener(this._onRuntimeMessage.bind(this));
        },
        
        signIn: function () {
            if (!this.canSignIn()) return;

            this.set('signedIn', false);
            this.set('signingIn', true);

            var foundUserId = Settings.get('userId');

            if (foundUserId !== null) {
                //this.set('id', foundUserId);
                this._fetch();
            } else {
                this._create();
            }
        },
        
        //  No stored ID found at any client storage spot. Create a new user and use the returned user object.
        _create: function () {
            this.save({}, {
                success: this._onSignInSuccess.bind(this),
                error: this._onSignInError.bind(this)
            });
        },
        
        //  Loads user data by ID from the server, writes the ID to client-side storage locations
        //  for future loading and then announces that the user has been signedIn.
        _fetch: function () {
            this.fetch({
                success: this._onSignInSuccess.bind(this),
                error: this._onSignInError.bind(this)
            });
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
            this.set('signInRetryTimer', 30);
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
                    this.signIn();
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

                this.signIn();
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
        
        _onSignInSuccess: function () {
            //  TODO: Go through User instead of Playlists.
            //  Set a global Playlists with the user's playlists for ease of use in getting user's playlists later.
            Playlists.reset(this.get('playlists'));
            Playlists.setUserId(this.get('id'));

            if (_.isUndefined(Playlists.getActivePlaylist())) {
                Playlists.at(0).set('active', true);
            }

            //  Announce that user has signedIn so managers can use it to fetch data.
            this.set('signingIn', false);
            this.set('signedIn', true);
            Settings.set('userId', this.get('id'));
        },
        
        updateWithGooglePlusId: function(googlePlusId) {
            //  Testing that GooglePlusId logic works before relying on it.
            $.ajax({
                url: Settings.get('serverURL') + 'User/UpdateGooglePlusId',
                type: 'PATCH',
                data: {
                    userId: this.get('id'),
                    googlePlusId: googlePlusId
                }
            });
        },
        
        tryLoginWithGooglePlusId: function (googlePlusId) {
            //$.ajax({
            //    url: Settings.get('serverURL') + 'User/GetByGooglePlusId',
            //    contentType: 'application/json; charset=utf-8',
            //    data: {
            //        googlePlusId: googlePlusId
            //    },
            //    success: function (userDto) {

            //        if (userDto && userDto.id !== null) {
            //            //user.set(userDto);
            //        } else {
            //            this.tryLoginFromStorage();
            //        }

            //    }
            //}.bind(this));
        }
    });

    //  Exposed globally so that the foreground can access the same instance through chrome.extension.getBackgroundPage()
    window.User = new User();
    return window.User;
});