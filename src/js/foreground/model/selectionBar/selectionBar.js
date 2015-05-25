define(function() {
  'use strict';

  var SelectionBar = Backbone.Model.extend({
    defaults: {
      // A reference to the collection which currently has selected models. Only one collection can have selected models at a time.
      activeCollection: null,
      selectedCount: 0,
      canAdd: false,
      canDelete: false,
      canSave: false,
      canPlay: false,
      signInManager: null,
      streamItems: null,
      searchResults: null
    },

    streamItemsEvents: {
      'add:completed': '_onStreamItemsAddCompleted',
      'remove': '_onStreamItemsRemove',
      'reset': '_onStreamItemsReset'
    },

    multiSelectCollectionEvents: {
      'change:selected': '_onMultiSelectCollectionChangeSelected',
      'remove': '_onMultiSelectCollectionRemove'
    },

    playlistsEvents: {
      'change:active': '_onPlaylistsChangeActive'
    },

    initialize: function() {
      var signInManager = this.get('signInManager');
      var signedInUser = signInManager.get('signedInUser');
      var activeCollection = this.get('activeCollection');
      this._setState(activeCollection, signInManager.get('signedInUser'));

      // If user is currently signed in then listen to their activePlaylist's selection events.
      if (!_.isNull(signedInUser)) {
        this._setUserBindings(signedInUser, true);
      }

      Marionette.bindEntityEvents(this, this.get('streamItems'), this.multiSelectCollectionEvents);
      Marionette.bindEntityEvents(this, this.get('searchResults'), this.multiSelectCollectionEvents);
      this.on('change:activeCollection', this._onChangeActiveCollection);
      this.listenTo(signInManager, 'change:signedInUser', this._onSignInManagerChangeSignedInUser);

      Marionette.bindEntityEvents(this, this.get('streamItems'), this.streamItemsEvents);
    },

    _onChangeActiveCollection: function(model, activeCollection) {
      var signedInUser = this.get('signInManager').get('signedInUser');
      this._setState(activeCollection, signedInUser);
    },

    _onSignInManagerChangeSignedInUser: function(model, signedInUser) {
      var activeCollection = this.get('activeCollection');
      this._setState(activeCollection, signedInUser);

      // Bind/unbind listeners as appropriate whenver the signedInUser changes.
      if (_.isNull(signedInUser)) {
        this._setUserBindings(model.previous('signedInUser'), false);
      } else {
        this._setUserBindings(signedInUser, true);
      }
    },

    // Keep track of which multi-select collection is currently holding selected items
    _onMultiSelectCollectionChangeSelected: function(model, selected) {
      this._setActiveCollection(model.collection, selected);
      this._setSelectedCount();
      this._setCanAddState(this.get('activeCollection'));
    },

    // If a selected model is removed from a collection then a 'change:selected' event does not fire.
    _onMultiSelectCollectionRemove: function(model, collection) {
      this._setActiveCollection(collection, false);
      this._setSelectedCount();
    },

    // Bind/unbind listeners as appropriate whenever the active playlist changes.
    _onPlaylistsChangeActive: function(model, active) {
      if (active) {
        Marionette.bindEntityEvents(this, model.get('items'), this.multiSelectCollectionEvents);
      } else {
        Marionette.unbindEntityEvents(this, model.get('items'), this.multiSelectCollectionEvents);
      }
    },

    _onStreamItemsAddCompleted: function() {
      this._setCanAddState(this.get('activeCollection'));
    },

    _onStreamItemsRemove: function() {
      this._setCanAddState(this.get('activeCollection'));
    },

    _onStreamItemsReset: function() {
      this._setCanAddState(this.get('activeCollection'));
    },

    _setState: function(activeCollection, signedInUser) {
      var activeCollectionExists = !_.isNull(activeCollection);
      var isSignedIn = !_.isNull(signedInUser);

      this.set('canPlay', activeCollectionExists);
      this.set('canSave', activeCollectionExists && isSignedIn);
      // Some collections, such as search results, contain models which should not be deleted.
      this.set('canDelete', activeCollectionExists && !activeCollection.isImmutable);

      this._setCanAddState(activeCollection);
    },

    _setCanAddState: function(activeCollection) {
      var canAdd = !_.isNull(activeCollection);

      if (canAdd) {
        var selectedSongs = activeCollection.getSelectedSongs();
        var duplicatesInfo = this.get('streamItems').getDuplicatesInfo(selectedSongs);
        canAdd = !duplicatesInfo.allDuplicates;
      }

      this.set('canAdd', canAdd);
    },

    // Keep track of which collection currently has selected songs by handling selection & deselection events.
    _setActiveCollection: function(collection, isSelecting) {
      var hasSelectedItems = collection.selected().length > 0;

      if (hasSelectedItems) {
        // isSelecting is needed because if one collection has two models selected and another collection's model is selected
        // then the first collection will de-select one of its models after the second collection has selected one of its own.
        // This results in two collections both having selected models and the activeCollection is incorrect.
        // isSelecting lets us know that one of those collections is not the active collection.
        if (isSelecting) {
          this.set('activeCollection', collection);
        }
      } else if (this.get('activeCollection') === collection) {
        this.set('activeCollection', null);
      }
    },

    // Update the number of songs which are currently selected
    _setSelectedCount: function() {
      var activeCollection = this.get('activeCollection');
      var songCount = _.isNull(activeCollection) ? 0 : activeCollection.selected().length;
      this.set('selectedCount', songCount);
    },

    // Bind or unbind entity events to a user's playlists and activePlaylist's items.
    // Useful for when a user is signing in/out.
    _setUserBindings: function(user, isBinding) {
      var bindingAction = isBinding ? Marionette.bindEntityEvents : Marionette.unbindEntityEvents;

      var playlists = user.get('playlists');
      bindingAction.call(this, this, playlists, this.playlistsEvents);

      var playlistItems = playlists.getActivePlaylist().get('items');
      bindingAction.call(this, this, playlistItems, this.multiSelectCollectionEvents);
    }
  });

  return SelectionBar;
});