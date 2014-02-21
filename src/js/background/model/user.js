//  A singleton representing the sole logged on user for the program.
//  Tries to load itself by ID stored in localStorage and then by chrome.storage.sync.
//  If still unloaded, tells the server to create a new user and assumes that identiy.
define([
    'background/collection/playlists',
    'background/model/settings'
], function (Playlists, Settings) {
    'use strict';

    //  If the foreground requests the user, don't instantiate a new one -- return the existing one from the background.
    if (!_.isUndefined(chrome.extension.getBackgroundPage().window.User)) {
        return chrome.extension.getBackgroundPage().window.User;
    }

    var syncUserIdKey = 'UserId';

    //  User data will be loaded either from cache or server.
    var User = Backbone.Model.extend({
        defaults: function() {
            return {
                id: null,
                googlePlusId: '',
                name: '',
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
            
            chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {

                switch (request.method) {
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

                console.log("sign in failed");

                var signInRetryInterval = this.get('signInRetryInterval');
                clearInterval(signInRetryInterval);

                if (signInFailed) {

                    signInRetryInterval = window.setInterval(function () {

                        console.log("interval tick", this.get('signInRetryTimer'));

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

            //  Trying to get user's info without signing in, it will work if the
            //  Application was previously authorized by the user.
            //this.getUserInfo(function (userInfo) {
            //    console.log("User Info:", userInfo);

            //    if (userInfo === null) {
            //        //  There was an issue fetching your information
            //        this.signIn();
            //    } else {
            //        this.tryLoginWithGooglePlusId();
            //    }

            //}.bind(this));
        },
        
        signIn: function () {
            
            this.set('signedIn', false);
            this.set('signingIn', true);
            this.set('signInFailed', false);

            //  chrome.Storage.sync is cross-computer syncing with restricted read/write amounts.
            chrome.storage.sync.get(syncUserIdKey, function (data) {
                //  Look for a user id in sync, it might be undefined though.
                var foundUserId = data[syncUserIdKey];

                if (_.isUndefined(foundUserId)) {

                    foundUserId = Settings.get('userId');

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

                } else {
                    //  Update the model's id to proper value and call fetch to retrieve all data from server.
                    this.set('id', foundUserId);

                    //  Pass false due to success of fetching from chrome.storage.sync -- no need to overwrite with same data.
                    this.loadFromServer(false);
                }
            }.bind(this));

        },
        
        getUserInfo: function (onUserInfoReceived) {
            this.getAuthToken(false, true, onUserInfoReceived);
        },
        
        getAuthToken: function (interactive, retry, onUserInfoReceived) {

            if (typeof chrome.identity === 'undefined') {
                console.error('chrome.identity permission not granted.');
                onUserInfoReceived(null);
                return;
            }

            console.log("I am now calling chrome.identity.getAuthToken with interactive set to: " + interactive + " and retry set to " + retry);
            chrome.identity.getAuthToken({ interactive: interactive }, function (authToken) {
                
                if (chrome.runtime.lastError) {
                    //  The most common error here would be the fact the user isn't signed into Google Chrome.
                    var errorMessage = chrome.runtime.lastError.message;
                    console.error(errorMessage);
                    onUserInfoReceived(null);
                    
                    if (errorMessage === 'The user is not signed in.') {
                        //  TODO: It is bad form to just automatically prompt the user to sign-in.
                        //  The interactive: true flag should only be set after a user interaction such as clicking a "sign-in" button.
                        //this.getAuthToken(true, retry, onUserInfoReceived);
                    }

                } else {
                    this.getUserInfoWithAuthToken(authToken, retry, onUserInfoReceived);
                }

            }.bind(this));
            
        },
        
        getUserInfoWithAuthToken: function (authToken, retry, onUserInfoReceived) {
            
            $.ajax({
                url: 'https://www.googleapis.com/plus/v1/people/me',
                headers: {
                    'Authorization': 'Bearer ' + authToken
                },
                success: function (response) {
                    console.log("Received user info");
                    onUserInfoReceived(response);
                },
                error: function (error) {

                    //  If authorization failure occurs - retry a second time after clearing any cached information which may be expired.
                    if (error.status == 401 && retry) {
                        chrome.identity.removeCachedAuthToken({ token: authToken }, function() {
                            this.getAuthToken(false, false, onUserInfoReceived);
                        }.bind(this));
                    } else {
                        onUserInfoReceived(null);
                        console.error(error);
                    }

                }.bind(this)
            });
            
        },
        
        addPlaylistByShareData: function (shareCodeShortId, urlFriendlyEntityTitle, callback) {
            
            $.ajax({
                url: Settings.get('serverURL') + 'Playlist/CreateCopyByShareCode',
                dataType: 'json',
                data: {
                    shareCodeShortId: shareCodeShortId,
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

        },
        
        onLoaded: function (model, setSyncStorage) {
            //  Set a global Playlists with the user's playlists for ease of use in getting user's playlists later.
            Playlists.reset(this.get('playlists'));
            //  TODO: shitty.
            Playlists.setUserId(this.get('id'));

            if (_.isUndefined(Playlists.getActivePlaylist())) {
                Playlists.at(0).set('active', true);
            }

            //  TODO: Error handling for writing to sync too much.
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

            this.getUserInfo(function(userInfo) {
                if (userInfo !== null && userInfo.id !== this.get('googlePlusId')) {
                    this.updateWithGooglePlusId(userInfo.id);
                }
            }.bind(this));
        },

        //  Loads user data by ID from the server, writes the ID to client-side storage locations
        //  for future loading and then announces that the user has been signedIn.
        loadFromServer: function(setSyncStorage) {
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
                type: 'POST',
                dataType: 'json',
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
            //    dataType: 'json',
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