define(function() {
  'use strict';

  var SelectionBar = Backbone.Model.extend({
    defaults: {
      // The collection which currently has selected models.
      // Only one collection can have selected models at a time.
      activeCollection: null,
      selectedCount: 0,
      canAdd: false,
      canDelete: false,
      canSave: false,
      canPlay: false,
      signInManager: null,
      activePlaylistManager: null,
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

    initialize: function() {
      this._setState(this.get('activeCollection'), this.get('signInManager').get('signedInUser'));

      var activePlaylist = this.get('activePlaylistManager').get('activePlaylist');
      if (!_.isNull(activePlaylist)) {
        this._setPlaylistBindings(activePlaylist, true);
      }

      this.on('change:activeCollection', this._onChangeActiveCollection);
      this.listenTo(this.get('signInManager'), 'change:signedInUser', this._onSignInManagerChangeSignedInUser);
      this.listenTo(this.get('activePlaylistManager'), 'change:activePlaylist', this._onActivePlaylistManagerChangeActivePlaylist);
      Marionette.bindEntityEvents(this, this.get('streamItems'), this.multiSelectCollectionEvents);
      Marionette.bindEntityEvents(this, this.get('searchResults'), this.multiSelectCollectionEvents);
      Marionette.bindEntityEvents(this, this.get('streamItems'), this.streamItemsEvents);
    },

    _onChangeActiveCollection: function(model, activeCollection) {
      var signedInUser = this.get('signInManager').get('signedInUser');
      this._setState(activeCollection, signedInUser);
    },

    _onSignInManagerChangeSignedInUser: function(model, signedInUser) {
      var activeCollection = this.get('activeCollection');
      this._setState(activeCollection, signedInUser);
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
    _onActivePlaylistManagerChangeActivePlaylist: function(model, activePlaylist) {
      if (_.isNull(activePlaylist)) {
        var previousActivePlaylist = model.previous('activePlaylist');

        if (!_.isNull(previousActivePlaylist)) {
          Marionette.unbindEntityEvents(this, previousActivePlaylist.get('items'), this.multiSelectCollectionEvents);
        }
      } else {
        Marionette.bindEntityEvents(this, activePlaylist.get('items'), this.multiSelectCollectionEvents);
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
        var selectedVideos = activeCollection.getSelectedVideos();
        var duplicatesInfo = this.get('streamItems').getDuplicatesInfo(selectedVideos);
        canAdd = !duplicatesInfo.allDuplicates;
      }

      this.set('canAdd', canAdd);
    },

    // Keep track of which collection currently has selected videos by handling selection & deselection events.
    _setActiveCollection: function(collection, isSelecting) {
      var hasSelectedItems = collection.getSelectedModels().length > 0;

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

    // Update the number of videos which are currently selected
    _setSelectedCount: function() {
      var activeCollection = this.get('activeCollection');
      var videoCount = _.isNull(activeCollection) ? 0 : activeCollection.getSelectedModels().length;
      this.set('selectedCount', videoCount);
    },

    // Bind or unbind entity events to a playlist's items.
    _setPlaylistBindings: function(playlist, isBinding) {
      var bindingAction = isBinding ? Marionette.bindEntityEvents : Marionette.unbindEntityEvents;
      var playlistItems = playlist.get('items');
      bindingAction.call(this, this, playlistItems, this.multiSelectCollectionEvents);
    }
  });

  return SelectionBar;
});