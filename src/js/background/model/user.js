import {Collection, Model} from 'backbone';
import Playlists from 'background/collection/playlists';

var User = Model.extend({
  defaults: {
    id: null,
    googlePlusId: '',
    playlists: null,
    language: ''
  },

  urlRoot: function() {
    return StreamusBG.serverUrl + 'User/';
  },

  loadByGooglePlusId: function() {
    $.ajax({
      url: StreamusBG.serverUrl + 'User/GetByGooglePlusId',
      contentType: 'application/json; charset=utf-8',
      data: {
        googlePlusId: this.get('googlePlusId')
      },
      success: this._onLoadByGooglePlusIdSuccess.bind(this),
      error: this._onLoadError.bind(this)
    });
  },

  // The googlePlusId associated with this account is already linked with another account.
  // Consolidate the two accounts and reload as a single user.
  mergeByGooglePlusId: function() {
    $.ajax({
      type: 'POST',
      url: StreamusBG.serverUrl + 'User/MergeByGooglePlusId',
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

    if (_.isNull(userId)) {
      this._create();
    } else {
      this._loadByUserId(userId);
    }
  },

  // A user is linked to a Google account if their GooglePlusId is not empty.
  linkedToGoogle: function() {
    return this.get('googlePlusId') !== '';
  },

  hasLinkedGoogleAccount: function(callback) {
    $.ajax({
      url: StreamusBG.serverUrl + 'User/HasLinkedGoogleAccount',
      contentType: 'application/json; charset=utf-8',
      data: {
        googlePlusId: this.get('googlePlusId')
      },
      success: callback,
      error: this._onLoadError.bind(this)
    });
  },

  // No stored ID found at any client storage spot. Create a new user and use the returned user object.
  _create: function() {
    this.save({
      // Provide language to prevent a second PATCH for updating language after creation.
      language: chrome.i18n.getUILanguage()
    }, {
      success: this._onLoadSuccess.bind(this),
      error: this._onLoadError.bind(this)
    });
  },

  // Loads user data by ID from the server, writes the ID to client-side storage locations
  // for future loading and then announces that the user has been loaded.
  _loadByUserId: function(userId) {
    this.set('id', userId);

    this.fetch({
      success: this._onLoadSuccess.bind(this),
      error: this._onLoadError.bind(this)
    });
  },

  // Set playlists as a Backbone.Collection from the JSON received from the server.
  _ensurePlaylistsCollection: function() {
    var playlists = this.get('playlists');

    // Need to convert playlists array to Backbone.Collection
    if (!(playlists instanceof Collection)) {
      // Silent because playlists is just being properly set.
      this.set('playlists', new Playlists(playlists, {
        userId: this.get('id')
      }), {
        silent: true
      });

      this.get('playlists').loadStoredState();
    }
  },

  _onLoadByGooglePlusIdSuccess: function(userDto) {
    if (_.isNull(userDto)) {
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
      this.save({language: language}, {patch: true});
    }
  }
});

export default User;