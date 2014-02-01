//  A singleton representing the sole logged on user for the program.
//  Tries to load itself by ID stored in localStorage and then by chrome.storage.sync.
//  If still unloaded, tells the server to create a new user and assumes that identiy.
define([
    'background/collection/folders',
    'background/model/settings'
], function (Folders, Settings) {
    'use strict';

    var syncUserIdKey = 'UserId';

    //  User data will be loaded either from cache or server.
    var User = Backbone.Model.extend({
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
        
        //  TODO: I feel like some of the work should've been done in parse and not onLoaded...
        urlRoot: Settings.get('serverURL') + 'User/',

        initialize: function () {

            //chrome.storage.sync.set({
            //    'dirty': false
            //});
            
            //var self = this;
            
            //  changes: Object mapping each key that changed to its corresponding StorageChange for that item.
            //  areaName: The name of the storage area (sync or local) the changes are for.
            //chrome.storage.onChanged.addListener(function (changes, areaName) {

            //    if (areaName === 'sync') {
            //        if (changes.dirty != null) {
            //            self.set('dirty', changes.dirty.newValue, { silent: true });
            //        }
                    
            //    }

            //});
            
            //  TODO: Consider rate limiting this if >1000 saves occur in an hour?
            //this.on('change:dirty', function (model, dirty) {

            //    chrome.storage.sync.set({
            //        'dirty': dirty
            //    });
            //});

            //  Trying to get user's info without signing in, it will work if the
            //  Application was previously authorized by the user.
            //this.getUserInfo(function (userInfo) {
            //    console.log("User Info:", userInfo);

            //    if (userInfo === null) {
            //        //  There was an issue fetching your information
            //        this.tryLoginFromStorage();
            //    } else {
            //        this.tryLoginWithGooglePlusId();
            //    }

            //}.bind(this));

            this.tryLoginFromStorage();

            //  newState is an enum of or "active"or "idle"or "locked"
            //chrome.idle.onStateChanged.addListener(function(newState) {

            //    if (newState == 'active' && self.get('dirty')) {
            //        //  Pass false due to success of fetching from chrome.storage.sync -- no need to overwrite with same data.
            //        // self.loadFromServer(false);
            //    }

            //});

            //  Start watching for changes to user or any collection/model underneath it to set dirty flag.
            //this.on('childSync', function () {
            //    this.set('dirty', true);
            //});
            
            //this.listenTo(Folders, 'sync', function () {
            //    this.trigger('childSync');
            //});
            
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
                        self.loadFromServer(true);
                    } else {

                        //  No stored ID found at any client storage spot. Create a new user and use the returned user object.
                        self.save({}, {
                            success: function (model) {
                                self.onLoaded(model, true);
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
                    self.loadFromServer(false);
                }
            });


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
            
            var self = this;

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
                            self.getAuthToken(false, false, onUserInfoReceived);
                        });
                    } else {
                        onUserInfoReceived(null);
                        console.error(error);
                    }

                }
            });
            
        },
        
        onLoaded: function (model, setSyncStorage) {
            //  Set a global Folders with the user's folders for ease of use in getting user's folders later.
            Folders.reset(this.get('folders'));

            //  In the future there might need to be logic here for marking an appropriate folder as active, but for now only 1 folder so it is the active one.
            Folders.at(0).set('active', true);

            //  TODO: Error handling for writing to sync too much.
            //  Write to sync as little as possible because it has restricted read/write limits per hour.
            if (setSyncStorage) {

                //  Using the bracket access notation here to leverage the variable which stores the key for chrome.storage.sync
                //  I want to be able to ensure I am getting/setting from the same location, thus the variable.
                var storedKey = {};
                storedKey[syncUserIdKey] = model.get('id');

                chrome.storage.sync.set(storedKey);
            }

            //  Announce that user has loaded so managers can use it to fetch data.
            this.set('loaded', true);
            Settings.set('userId', this.get('id'));

            console.log('onLoaded has fired. Calling getUserInfo', this);

            this.getUserInfo(function(userInfo) {
                if (userInfo !== null && userInfo.id !== this.get('googlePlusId')) {
                    this.updateWithGooglePlusId(userInfo.id);
                }
            }.bind(this));

            console.log("User has loaded with UserID:", this.get('id'));
        },

        //  Loads user data by ID from the server, writes the ID
        //  to client-side storage locations for future loading and then announces
        //  that the user has been loaded fully.
        loadFromServer: function(setSyncStorage) {
            var self = this;

            this.set('loaded', false);
            this.fetch({
                success: function (model) {
                    self.onLoaded(model, setSyncStorage);
                },
                error: function (error) {
                    console.error(error);

                    //  If there's an error fetching the user with localDebug enabled -- probably just swapped between DBs
                    //  Its OK to reset the user for debugging purposes. It is NOT ok to reset the user in deployment.
                    if (Settings.get('localDebug')) {

                        self.set('id', null);
                        //  No stored ID found at any client storage spot. Create a new user and use the returned user object.
                        self.save({}, {
                            success: function (model) {
                                self.onLoaded(model, true);
                            }
                        });
                    }

                }
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