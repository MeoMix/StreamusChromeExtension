//  A singleton representing the sole logged on user for the program.
//  Tries to load itself by ID stored in localStorage and then by chrome.storage.sync.
//  If still unloaded, tells the server to create a new user and assumes that identiy.
define(function () {
    'use strict';

    var User = Backbone.Model.extend({
        defaults: function() {
            return {
                id: null,
                googlePlusId: '',
                playlists: null
            };
        },
        
        urlRoot: function() {
            return Streamus.serverUrl + 'User/';
        },
        
        //  TODO: FIX FIX FIX
        globalPlaylists: null,

        initialize: function (options) {
            console.log('options:', options);
            this.globalPlaylists = options.globalPlaylists;

            this._getLocalUserId();
        },
        
        loadByGooglePlusId: function () {
            $.ajax({
                url: Streamus.serverUrl + 'User/GetByGooglePlusId',
                contentType: 'application/json; charset=utf-8',
                data: {
                    googlePlusId: this.get('googlePlusId')
                },
                success: this._onLoadByGooglePlusIdSuccess.bind(this),
                error: this._onLoadError.bind(this)
            });
        },
        
        //  The googlePlusId associated with this account is already linked with another account. Merge them together and re-load as one user.
        mergeByGooglePlusId: function() {
            $.ajax({
                type: 'POST',
                url: Streamus.serverUrl + 'User/MergeByGooglePlusId',
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
            userId === null ? this._create() : this._loadByUserId(userId);
        },
        
        //  A user is linked to a Google account if their GooglePlusId is not empty.
        linkedToGoogle: function () {
            return this.get('googlePlusId') !== '';
        },
        
        hasLinkedGoogleAccount: function(callback) {
            $.ajax({
                url: Streamus.serverUrl + 'User/HasLinkedGoogleAccount',
                contentType: 'application/json; charset=utf-8',
                data: {
                    googlePlusId: this.get('googlePlusId')
                },
                success: callback,
                error: this._onLoadError.bind(this)
            });
        },
        
        _getLocalUserId: function () {
            var userId = localStorage.getItem('userId');
            
            //  NOTE: This is a bit of legacy code. Originally was calling toJSON on all objects written to localStorage, so quotes might exist.
            if (userId !== null) {
                userId = userId.replace(/"/g, '');
            }

            return userId;
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
            this.globalPlaylists.reset(this.get('playlists'));
            this.globalPlaylists.setUserId(this.get('id'));
        },
        
        _onLoadByGooglePlusIdSuccess: function(userDto) {
            if (userDto === null) throw new Error("UserDTO should always be returned here.");

            this.set(userDto);
            this._onLoadSuccess();
        },
        
        _onLoadError: function (error) {
            this.trigger('loadError', error);
        },
        
        _onLoadSuccess: function() {
            this._setPlaylists();
            localStorage.setItem('userId', this.get('id'));
            this.trigger('loadSuccess');
        }
    });

    return User;
});