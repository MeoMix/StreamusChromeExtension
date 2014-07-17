//  A singleton representing the sole logged on user for the program.
//  Tries to load itself by ID stored in localStorage and then by chrome.storage.sync.
//  If still unloaded, tells the server to create a new user and assumes that identiy.
define([
    'background/collection/playlists',
    'background/model/settings'
], function (Playlists, Settings) {
    'use strict';

    var syncUserIdKey = 'UserId';

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
        
        //  TODO: I feel like some of the work should've been done in parse and not onLoaded...
        urlRoot: Settings.get('serverURL') + 'User/',

        initialize: function () {
            //console.log('chrome.identity', chrome.identity.getProfileUserInfo(function(a) { console.log('a', a) }));

            this.on('change:signedIn', this._onSignedInChanged);
            
            chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {

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
                        this.addPlaylistByShareData(request.shareCodeShortId, request.urlFriendlyEntityTitle, function (playlist) {
                            if (playlist) {
                                sendResponse({
                                    result: 'success',
                                    playlistTitle: playlist.get('title')
                                });
                            } else {
                                sendResponse({ result: 'error' });
                            }
                        });
                        break;
                }

            }.bind(this));

            this.on('change:signInFailed', function (model, signInFailed) {
                var signInRetryInterval = this.get('signInRetryInterval');
                clearInterval(signInRetryInterval);

                if (signInFailed) {

                    signInRetryInterval = window.setInterval(function () {
                        var signInRetryTimer = this.get('signInRetryTimer');

                        if (signInRetryTimer === 1) {
                            clearInterval(this.get('signInRetryTimerInterval'));
                            this.set('signInRetryTimer', 30);
                            this.set('signInFailed', false);
                        }

                        this.set('signInRetryTimer', this.get('signInRetryTimer') - 1);
                    }.bind(this), 1000);

                    this.set('signInRetryInterval', signInRetryInterval);
                } else {
                    this.set('signInRetryTimer', 30);
                }
            });
        },
        
        _onSignedInChanged: function(model, signedIn) {
            this.notifyYouTubeTabsSignedIn(signedIn);
        },
        
        //  Send a message to open YouTube tabs that Streamus has signed in and their HTML needs to update.
        notifyYouTubeTabsSignedIn: function (signedIn) {
            //  TODO: Is tabs sufficient here? Do I need to do windows, as well? 
            chrome.tabs.query({ url: '*://*.youtube.com/watch?v*' }, function (tabs) {
                _.each(tabs, function (tab) {

                    var event;
                    if (signedIn) {
                        event = 'signed-in';
                    } else {
                        event = 'signed-out';
                    }

                    chrome.tabs.sendMessage(tab.id, {
                        event: event
                    });
                });
            });
        },
        
        canSignIn: function () {
            //  User can only sign in if they're not signed in, not in the process of being signed in and if they're not waiting for signInFailure timer.
            var canSignIn = !this.get('signedIn') && !this.get('signingIn') && !this.get('signInFailed');

            return canSignIn;
        },
        
        signIn: function () {
            if (!this.canSignIn()) return;

            this.set('signedIn', false);
            this.set('signingIn', true);
            this.set('signInFailed', false);

            //  chrome.Storage.sync is cross-computer syncing with restricted read/write amounts.
            //chrome.storage.sync.get(syncUserIdKey, function (data) {
            //    //  Look for a user id in sync, it might be undefined though.
            //    var foundUserId = data[syncUserIdKey];

            //    if (_.isUndefined(foundUserId)) {

                    var foundUserId = Settings.get('userId');

                    if (foundUserId !== null) {
                        this.set('id', foundUserId);
                        this.loadFromServer(true);
                    } else {

                        //  No stored ID found at any client storage spot. Create a new user and use the returned user object.
                        this.save({}, {
                            success: function (model) {
                                this.onLoaded(model, true);
                            }.bind(this),
                            error: function (error) {
                                console.error(error);
                                this.set('signInFailed', true);
                            }.bind(this)
                        });
                    }

            //    } else {
            //        //  Update the model's id to proper value and call fetch to retrieve all data from server.
            //        this.set('id', foundUserId);

            //        //  Pass false due to success of fetching from chrome.storage.sync -- no need to overwrite with same data.
            //        this.loadFromServer(false);
            //    }
            //}.bind(this));

        },
        
        addPlaylistByShareData: function (shortId, urlFriendlyEntityTitle, callback) {
            if (this.canSignIn()) {
                this.listenToOnce(this, 'change:signedIn', function() {
                    this.addPlaylistByShareData(shortId, urlFriendlyEntityTitle, callback);
                });

                this.signIn();
            } else {
                $.ajax({
                    type: 'POST',
                    url: Settings.get('serverURL') + 'Playlist/CreateCopyByShareCode',
                    data: {
                        shortId: shortId,
                        urlFriendlyEntityTitle: urlFriendlyEntityTitle,
                        userId: this.get('id')
                    },
                    success: function (playlistDto) {
                        //  Add and convert back from JSON to Backbone object.
                        var playlist = Playlists.add(playlistDto);
                        callback(playlist);
                    }.bind(this),
                    error: function (error) {
                        console.error("Error adding playlist by share data", error);
                        callback();
                    }
                });
            }
        },
        
        onLoaded: function (model, setSyncStorage) {
            //  TODO: Go through User instead of Playlists.
            //  Set a global Playlists with the user's playlists for ease of use in getting user's playlists later.
            Playlists.reset(this.get('playlists'));
            Playlists.setUserId(this.get('id'));

            if (_.isUndefined(Playlists.getActivePlaylist())) {
                Playlists.at(0).set('active', true);
            }
            
            //  Write to sync as little as possible because it has restricted read/write limits per hour.
            var settingsUserId = Settings.get('userId');

            //  If settings has changed -- assume need to keep in sync no matter what.
            if (setSyncStorage || settingsUserId !== this.get('id')) {
                //  Using the bracket access notation here to leverage the variable which stores the key for chrome.storage.sync
                //  I want to be able to ensure I am getting/setting from the same location, thus the variable.
                var storedKey = {};
                storedKey[syncUserIdKey] = model.get('id');

                chrome.storage.sync.set(storedKey);
            }

            //  Announce that user has signedIn so managers can use it to fetch data.
            this.set('signingIn', false);
            this.set('signedIn', true);
            Settings.set('userId', this.get('id'));
        },

        //  Loads user data by ID from the server, writes the ID to client-side storage locations
        //  for future loading and then announces that the user has been signedIn.
        loadFromServer: function (setSyncStorage) {
            this.fetch({
                success: function (model) {
                    this.onLoaded(model, setSyncStorage);
                }.bind(this),
                error: function () {
                    this.set('signingIn', false);
                    this.set('signInFailed', true);
                }.bind(this)
            });
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