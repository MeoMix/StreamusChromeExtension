define(function(require) {
    'use strict';

    var Playlists = require('background/collection/playlists');

    var User = Backbone.Model.extend({
        defaults: {
            id: null,
            googlePlusId: '',
            playlists: null,
            language: ''
        },

        urlRoot: function() {
            return Streamus.serverUrl + 'User/';
        },

        loadByGooglePlusId: function() {
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

        tryloadByUserId: function() {
            var userId = localStorage.getItem('userId');

            if (userId === null) {
                this._create();
            } else {
                this._loadByUserId(userId);
            }
        },
        
        //  A user is linked to a Google account if their GooglePlusId is not empty.
        linkedToGoogle: function() {
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
        
        //  No stored ID found at any client storage spot. Create a new user and use the returned user object.
        _create: function() {
            this.save({
                //  Save the language here upon creation because the user is clearly unknown and it'll save a PATCH request by knowing language on creation.
                language: chrome.i18n.getUILanguage()
            }, {
                success: this._onLoadSuccess.bind(this),
                error: this._onLoadError.bind(this)
            });
        },
        
        //  Loads user data by ID from the server, writes the ID to client-side storage locations
        //  for future loading and then announces that the user has been loaded.
        _loadByUserId: function(userId) {
            this.set('id', userId);

            this.fetch({
                success: this._onLoadSuccess.bind(this),
                error: this._onLoadError.bind(this)
            });
        },
        
        //  Set playlists as a Backbone.Collection from the JSON received from the server.
        _ensurePlaylistsCollection: function() {
            var playlists = this.get('playlists');

            //  Need to convert playlists array to Backbone.Collection
            if (!(playlists instanceof Backbone.Collection)) {
                //  Silent because playlists is just being properly set.
                this.set('playlists', new Playlists([], {
                    userId: this.get('id')
                }), {
                    silent: true
                });

                //  Call reset afterward because I want to run _onReset logic which isn't ran when passing models into initial constructor.
                this.get('playlists').reset(playlists);
            }
        },

        _onLoadByGooglePlusIdSuccess: function(userDto) {
            if (userDto === null) {
                throw new Error('UserDTO should always be returned here.');
            }

            this.set(userDto);
            this._onLoadSuccess();
        },

        _onLoadError: function(error) {
            this.trigger('loadError', error);
        },

        _onLoadSuccess: function() {
            this._ensurePlaylistsCollection();
            this._setLanguage();
            localStorage.setItem('userId', this.get('id'));
            this.trigger('loadSuccess');
        },

        _setLanguage: function() {
            var language = chrome.i18n.getUILanguage();
            if (this.get('language') !== language) {
                this.save({ language: language }, { patch: true });
            }
        }
    });

    return User;
});