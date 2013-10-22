//  A singleton representing the sole logged on user for the program.
//  Tries to load itself by ID stored in localStorage and then by chrome.storage.sync.
//  If still unloaded, tells the server to create a new user and assumes that identiy.
var User = null;
define([
    'folders',
    'settings'
], function (Folders, Settings) {
    'use strict';

    var syncUserIdKey = 'UserId';

    //  User data will be loaded either from cache or server.
    var userModel = Backbone.Model.extend({
        defaults: function() {
            return {
                id: null,
                googlePlusId: '',
                name: '',
                dirty: false,
                loaded: false,
                folders: null
            };
        },
        
        //  TODO: I feel like some of the work should've been done in parse and not onUserLoaded...

        urlRoot: Settings.get('serverURL') + 'User/',

        initialize: function () {
            console.log("user is initializing");
            
            chrome.storage.sync.set({
                'dirty': false
            });
            
            var self = this;
            
            //  changes: Object mapping each key that changed to its corresponding StorageChange for that item.
            //  areaName: The name of the storage area (sync or local) the changes are for.
            chrome.storage.onChanged.addListener(function (changes, areaName) {

                if (areaName === 'sync') {
                    var dirtyChange = changes['dirty'];
                    
                    if (dirtyChange != null) {
                        self.set('dirty', dirtyChange.newValue, { silent: true });
                    }
                    
                }

            });
            
            //  TODO: Consider rate limiting this if >1000 saves occur in an hour?
            this.on('change:dirty', function (model, dirty) {

                chrome.storage.sync.set({
                    'dirty': dirty
                });
            });

            console.log("Requesting");
            


            //console.log("Identity:", chrome.identity);
            //chrome.identity.onSignInChanged.addListener(function (account, signedIn) {
            //    console.log("HELLO:", account, signedIn);
            //});

            //setTimeout(function () {

            //chrome.identity.getAuthToken({ 'interactive': true }, function (authToken) {
            //    console.log("authToken:", authToken);

            //    setTimeout(function () {
            //        gapi.auth.setToken(authToken);

            //        gapi.client.load('plus', 'v1', function () {

            //            var request = gapi.client.plus.people.get({
            //                'userId': 'me'
            //            });

            //            request.execute(function (resp) {
            //                console.log("Response:", resp);
            //            });

            //        });
            //    });

            //});

            //}, 200);
            
            this.tryLoginFromStorage();

            //var authorizeImmediately = true;
            //this.tryAuthorize(authorizeImmediately, function (authResult) {
                
            //    if (authResult == null) {
            //        authorizeImmediately = false;
                    
            //        self.tryAuthorize(authorizeImmediately, function (immediateAuthResult) {

            //            if (immediateAuthResult == null) {
            //                console.error("Unable to authorize. Sorry.");
            //            } else {
            //                self.doOnAuthorize();
            //            }

            //        });

            //    } else {
            //        self.doOnAuthorize();
            //    }

            //});

            //  newState is an enum of or "active"or "idle"or "locked"
            chrome.idle.onStateChanged.addListener(function(newState) {

                if (newState == 'active' && self.get('dirty')) {
                    console.log("Refetching user");
                    //  Pass false due to success of fetching from chrome.storage.sync -- no need to overwrite with same data.
                    fetchUser.call(self, false);
                }

            });

            //  Start watching for changes to user or any collection/model underneath it to set dirty flag.
            this.on('childSync', function () {
                this.set('dirty', true);
            });
            
            this.listenTo(Folders, 'sync', function () {
                this.trigger('childSync');
            });
            
            this.listenTo(Folders, 'change:active', function (folder, isActive) {
                //  Keep local storage up-to-date with the active folder.
                if (isActive) {
                    localStorage.setItem(this.get('id') + '_activeFolderId', folder.get('id'));
                }
            });
        },
        
        tryAuthorize: function (immediate, callback) {
            
            gapi.auth.authorize({
                client_id: '346456917689-dtfdla6c18cn78u3j5subjab1kiq3jls.apps.googleusercontent.com',
                scope: 'https://www.googleapis.com/auth/plus.login https://www.googleapis.com/auth/plus.me',
                //  Set immediate to false if authResult returns null
                immediate: immediate
            }, callback);
            
        },
        
        doOnAuthorize: function () {
            
            gapi.client.load('plus', 'v1', function () {

                var request = gapi.client.plus.people.get({
                    'userId': 'me'
                });

                request.execute(function (response) {
                    console.log("Response:", response);

                    if (response && response.id && response.id.length > 0) {
                        console.log("Setting user's googlePlusId");

                        $.ajax({
                            url: Settings.get('serverURL') + 'User/GetByGooglePlusId',
                            type: 'GET',
                            contentType: 'application/json; charset=utf-8',
                            dataType: 'json',
                            data: {
                                googlePlusId: response.id
                            },
                            success: function(userDto) {
                                console.log("UserDto:", userDto);
                                if (userDto && userDto.id !== null) {
                                    console.log("Setting from DTO");
                                    user.set(userDto);
                                } else {
                                    console.log("Load from storage.sync if possible, or create new.");

                                    this.tryLoginFromStorage();

                                }

                            }
                        });
                    } else {
                        this.tryLoginFromStorage();
                    }

                });

            });
            
        },
        
        tryLoginFromStorage: function() {

            var self = this;

            //  chrome.Storage.sync is cross-computer syncing with restricted read/write amounts.
            chrome.storage.sync.get(syncUserIdKey, function (data) {
                //  Look for a user id in sync, it might be undefined though.
                var foundUserId = data[syncUserIdKey];

                if (typeof foundUserId === 'undefined') {

                    foundUserId = Settings.get('userId');

                    if (foundUserId !== null) {
                        self.set('id', foundUserId);
                        fetchUser.call(self, true);
                    } else {

                        //  No stored ID found at any client storage spot. Create a new user and use the returned user object.
                        self.save({}, {
                            success: function (model) {
                                onUserLoaded.call(self, model, true);
                            },
                            error: function (error) {
                                console.error(error);
                            }
                        });
                    }

                } else {

                    //  Update the model's id to proper value and call fetch to retrieve all data from server.
                    self.set('id', foundUserId);

                    //  Pass false due to success of fetching from chrome.storage.sync -- no need to overwrite with same data.
                    fetchUser.call(self, false);
                }
            });


        }
    });
    
    function onUserLoaded(model, shouldSetSyncStorage) {
        console.log("user loaded, setting folders");
        //  Set a global Folders with the user's folders for ease of use in getting user's folders later.
        Folders.reset(this.get('folders'));

        //  Try to load active folder from localstorage
        if (Folders.length > 0) {

            var activeFolderId = localStorage.getItem(this.get('id') + '_activeFolderId');

            //  Be sure to always have an active folder if there is one available.
            var folderToSetActive = Folders.get(activeFolderId) || Folders.at(0);
            folderToSetActive.set('active', true);

        }

        //  TODO: Error handling for writing to sync too much.
        //  Write to sync as little as possible because it has restricted read/write limits per hour.
        if (shouldSetSyncStorage) {

            //  Using the bracket access notation here to leverage the variable which stores the key for chrome.storage.sync
            //  I want to be able to ensure I am getting/setting from the same location, thus the variable.
            var storedKey = {};
            storedKey[syncUserIdKey] = model.get('id');

            chrome.storage.sync.set(storedKey);
        }

        //  Announce that user has loaded so managers can use it to fetch data.
        console.log("About to set loaded to true:", this);
        this.set('loaded', true);
        Settings.set('userId', this.get('id'));
    }
    
    //  Loads user data by ID from the server, writes the ID
    //  to client-side storage locations for future loading and then announces
    //  that the user has been loaded fully.

    function fetchUser(shouldSetSyncStorage) {
        var self = this;

        this.set('loaded', false);
        this.fetch({
            success: function (model) {
                console.log("fetched");
                onUserLoaded.call(self, model, shouldSetSyncStorage);
            },
            error: function (error) {
                console.error(error);
                
                //  If there's an error fetching the user with localDebug enabled -- probably just swapped between DBs
                //  Its OK to reset the user for debugging purposes. It is NOT ok to reset the user in deployment.
                if (Settings.get('localDebug')) {

                    console.log("Creating new user.");
                    self.set('id', null);
                    //  No stored ID found at any client storage spot. Create a new user and use the returned user object.
                    self.save({}, {
                        success: function (model) {
                            onUserLoaded.call(self, model, true);
                        }
                    });
                }

            }
        });
    }

    //  Only ever instantiate one User.
    User = new userModel();
    
    return User;
});