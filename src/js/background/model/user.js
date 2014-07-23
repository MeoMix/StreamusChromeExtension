//  A singleton representing the sole logged on user for the program.
//  Tries to load itself by ID stored in localStorage and then by chrome.storage.sync.
//  If still unloaded, tells the server to create a new user and assumes that identiy.
define([
    'background/collection/playlists',
    'background/model/settings'
], function (Playlists, Settings) {
    'use strict';

    var User = Backbone.Model.extend({
        defaults: function() {
            return {
                id: null,
                googlePlusId: '',
                playlists: null
            };
        },
        
        urlRoot: Settings.get('serverURL') + 'User/',
        
        loadByGooglePlusId: function () {
            $.ajax({
                url: Settings.get('serverURL') + 'User/GetByGooglePlusId',
                contentType: 'application/json; charset=utf-8',
                data: {
                    googlePlusId: this.get('googlePlusId')
                },
                success: this._onLoadByGooglePlusIdSuccess.bind(this),
                error: this._onLoadError.bind(this)
            });
        },
        
        tryloadByUserId: function () {
            var userId = this._getLocalUserId();
            console.log("userId:", userId);
            userId === null ? this._create() : this._loadByUserId(userId);
        },
        
        updateGooglePlusId: function (googlePlusId) {
            this.set('googlePlusId', googlePlusId);

            $.ajax({
                url: Settings.get('serverURL') + 'User/UpdateGooglePlusId',
                type: 'PATCH',
                data: {
                    userId: this.get('id'),
                    googlePlusId: googlePlusId
                }
            });
        },
        
        _getLocalUserId: function() {
            return Settings.get('userId');
        },
        
        //  No stored ID found at any client storage spot. Create a new user and use the returned user object.
        _create: function () {
            //  TODO: I don't think clearing the ID is necessary anymore because we have two separate users.
            //  The current user's ID might be set because Chrome Sign In is occurring, but we want to create a new user with new Google Plus ID.
            //  So, always clear the current user ID before calling _create to ensure that happens.
            //this.set('id', null);
            this.save({}, {
                success: this._onLoadSuccess.bind(this),
                error: this._onLoadError.bind(this)
            });
        },
        
        //  Loads user data by ID from the server, writes the ID to client-side storage locations
        //  for future loading and then announces that the user has been loaded.
        _loadByUserId: function (userId) {
            this.set('id', userId);

            this.fetch({
                success: this._onLoadSuccess.bind(this),
                error: this._onLoadError.bind(this)
            });
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
        
        _onLoadByGooglePlusIdSuccess: function(userDto) {
            console.log("Fetch response:", userDto);
            if (userDto === null) {
                this.tryloadByUserId();
            } else {
                this.set(userDto);
                this._onLoadSuccess();
            }
        },
        
        _onLoadError: function (error) {
            console.log("_onLoadError", this);
            this.trigger('loadError', error);
        },
        
        _onLoadSuccess: function() {
            console.log("_onLoadSuccess", this);
            this._setPlaylists();
            Settings.set('userId', this.get('id'));
            this.trigger('loadSuccess');
        }
    });

    return User;
});