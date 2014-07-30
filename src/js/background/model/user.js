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
            console.log('tryLoadByUserId userId:', userId);
            userId === null ? this._create() : this._loadByUserId(userId);
        },
        
        updateGooglePlusId: function (googlePlusId) {
            this.set('googlePlusId', googlePlusId);

            $.ajax({
                url: Settings.get('serverURL') + 'User/UpdateGooglePlusId',
                type: 'PATCH',
                data: {
                    id: this.get('id'),
                    googlePlusId: googlePlusId
                }
            });
        },
        
        //  A user is linked to a Google account if their GooglePlusId is not empty.
        linkedToGoogle: function () {
            return this.get('googlePlusId') !== '';
        },
        
        hasLinkedGoogleAccount: function(callback) {
            $.ajax({
                url: Settings.get('serverURL') + 'User/HasLinkedGoogleAccount',
                contentType: 'application/json; charset=utf-8',
                data: {
                    googlePlusId: this.get('googlePlusId')
                },
                success: callback,
                error: this._onLoadError.bind(this)
            });
        },
        
        _getLocalUserId: function() {
            return Settings.get('userId');
        },
        
        //  No stored ID found at any client storage spot. Create a new user and use the returned user object.
        _create: function () {
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
            Playlists.reset(this.get('playlists'));
            Playlists.setUserId(this.get('id'));
        },
        
        _onLoadByGooglePlusIdSuccess: function(userDto) {
            if (userDto === null) throw new Error("UserDTO should always be returned here.");

            this.set(userDto);
            this._onLoadSuccess();
        },
        
        _onLoadError: function (error) {
            console.log("Load Error!", error);
            this.trigger('loadError', error);
        },
        
        _onLoadSuccess: function() {
            this._setPlaylists();
            Settings.set('userId', this.get('id'));
            this.trigger('loadSuccess');
        }
    });

    return User;
});