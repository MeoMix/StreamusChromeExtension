define(function (require) {
    'use strict';
    
    var Tooltip = require('foreground/view/behavior/tooltip');
    var SelectionBarTemplate = require('text!template/selectionBar/selectionBar.html');

    var SelectionBarView = Marionette.ItemView.extend({
        id: 'selectionBar',
        className: 'panel-content panel-content--uncolored',
        template: _.template(SelectionBarTemplate),
        
        templateHelpers: function () {
            return {
                viewId: this.id,
                playMessage: chrome.i18n.getMessage('play'),
                addMessage: chrome.i18n.getMessage('add'),
                saveMessage: chrome.i18n.getMessage('save'),
                deleteMessage: chrome.i18n.getMessage('delete')
            };
        },
        
        ui: function () {
            return {
                playButton: '#'+ this.id + '-playButton',
                addButton: '#' + this.id + '-addButton',
                saveButton: '#' + this.id + '-saveButton',
                deleteButton: '#' + this.id + '-deleteButton',
                selectionCountText: '#' + this.id + '-selectionCountText'
            };
        },
        
        events: {
            'click @ui.playButton': '_onClickPlayButton',
            'click @ui.addButton': '_onClickAddButton',
            'click @ui.saveButton': '_onClickSaveButton',
            'click @ui.deleteButton': '_onClickDeleteButton'
        },
        
        behaviors: {
            Tooltip: {
                behaviorClass: Tooltip
            }
        },
        
        streamItems: null,
        searchResults: null,
        signInManager: null,
        
        multiSelectCollectionEvents: {
            'change:selected': '_onMultiSelectCollectionChangeSelected',
            'remove': '_onMultiSelectCollectionRemove'
        },
        
        playlistsEvents: {
            'change:active': '_onPlaylistsChangeActive'
        },
        
        initialize: function() {
            this.streamItems = Streamus.backgroundPage.stream.get('items');
            this.searchResults = Streamus.backgroundPage.search.get('results');
            this.signInManager = Streamus.backgroundPage.signInManager;

            Marionette.bindEntityEvents(this, this.streamItems, this.multiSelectCollectionEvents);
            Marionette.bindEntityEvents(this, this.searchResults, this.multiSelectCollectionEvents);

            //  If user is currently signed in then listen to their activePlaylist's selection events.
            var signedInUser = this.signInManager.get('signedInUser');
            if (signedInUser !== null) {
                this._setUserBindings(signedInUser, true);
            }
            
            this.listenTo(this.signInManager, 'change:signedInUser', this._onSignInManagerChangeSignedInUser);
        },
        
        onRender: function () {
            this._setSelectionCountText();
            this._setButtonStates();
        },
        
        _onClickPlayButton: function () {
            var selectedSongs = this.model.get('activeCollection').getSelectedSongs();
            
            this.streamItems.addSongs(selectedSongs, {
                playOnAdd: true
            });
        },
        
        _onClickAddButton: function() {
            var selectedSongs = this.model.get('activeCollection').getSelectedSongs();
            this.streamItems.addSongs(selectedSongs);
        },
        
        _onClickSaveButton: function() {
            var canSave = this._canSave();

            if (canSave) {
                var offset = this.ui.saveButton.offset();

                Streamus.channels.saveSongs.commands.trigger('show:simpleMenu', {
                    playlists: this.signInManager.get('signedInUser').get('playlists'),
                    songs: this.model.get('activeCollection').getSelectedSongs(),
                    top: offset.top,
                    left: offset.left
                });
            }
        },
        
        _onClickDeleteButton: function() {
            //  TODO: Implement undo since I've opted to not show a dialog.
            var canDelete = true;
            
            if (canDelete) {
                var selectedModels = this.model.get('activeCollection').selected();
                _.invoke(selectedModels, 'destroy');
            }
        },
        
        //  Keep track of which multi-select collection is currently holding selected items
        _onMultiSelectCollectionChangeSelected: function (model, selected) {
            this._setActiveCollection(model.collection, selected);
            this._setSelectionCountText();
            this._setButtonStates();
        },
        
        //  If a selected model is removed from a collection then a 'change:selected' event does not fire.
        _onMultiSelectCollectionRemove: function (model, collection) {
            this._setActiveCollection(collection, false);
            this._setSelectionCountText();
            this._setButtonStates();
        },
        
        //  Bind/unbind listeners as appropriate whenever the active playlist changes.
        _onPlaylistsChangeActive: function (model, active) {
            if (active) {
                Marionette.bindEntityEvents(this, model.get('items'), this.multiSelectCollectionEvents);
            } else {
                Marionette.unbindEntityEvents(this, model.get('items'), this.multiSelectCollectionEvents);
            }
        },
        
        //  Bind/unbind listeners as appropriate whenver the signedInUser changes.
        _onSignInManagerChangeSignedInUser: function (model, signedInUser) {
            if (signedInUser === null) {
                this._setUserBindings(model.previous('signedInUser'), false);
            } else {
                this._setUserBindings(signedInUser, true);
            }
        },
        
        //  Keep track of which collection currently has selected songs by handling selection & deselection events.
        _setActiveCollection: function (collection, isSelecting) {
            var hasSelectedItems = collection.selected().length > 0;

            if (hasSelectedItems) {
                //  isSelecting is necessary because if one collection has 2 models selected and the user then selects a model in a different collection
                //  the first collection will de-select one of its models after the second collection has selected one of its own.
                //  This results in two collections both having selected models and the activeCollection is incorrect.
                //  By checking isSelecting we know that one collection is not the active collection - it's just in the process of de-selecting all of its models.
                if (isSelecting) {
                    this.model.set('activeCollection', collection);
                }
            }
            else if (this.model.get('activeCollection') === collection) {
                this.model.set('activeCollection', null);
            }
        },
        
        //  Bind or unbind entity events to a user's playlists and activePlaylist's items.
        //  Useful for when a user is signing in/out.
        _setUserBindings: function (user, isBinding) {
            var bindingAction = isBinding ? Marionette.bindEntityEvents : Marionette.unbindEntityEvents;

            var playlists = user.get('playlists');
            bindingAction(this, playlists, this.playlistsEvents);

            var playlistItems = playlists.getActivePlaylist().get('items');
            bindingAction(this, playlistItems, this.multiSelectCollectionEvents);
        },
        
        //  Update the text which shows how many songs are currently selected
        _setSelectionCountText: function () {
            var activeCollection = this.model.get('activeCollection');
            var activeCollectionExists = activeCollection !== null;
            var songCount = activeCollectionExists ? activeCollection.selected().length : 0;
            
            var selectionCountText = chrome.i18n.getMessage('collectionSelected', [songCount, chrome.i18n.getMessage(songCount === 1 ? 'song' : 'songs')]);
            this.ui.selectionCountText.html(selectionCountText);
        },
        
        //  Set buttons to disabled when transitioning the view out as well as handle specific scenarios for each button
        _setButtonStates: function () {
            var activeCollection = this.model.get('activeCollection');
            var activeCollectionExists = activeCollection !== null;

            this.ui.playButton.toggleClass('is-disabled', !activeCollectionExists);

            var isSignedIn = this.signInManager.get('signedInUser') !== null;
            this.ui.saveButton.toggleClass('is-disabled', !activeCollectionExists && isSignedIn);

            //  Delete is disabled if the user is selecting search results
            var canDelete = activeCollectionExists && !activeCollection.isImmutable;
            var deleteTitle = '';
            
            if (!canDelete && activeCollectionExists) {
                deleteTitle = chrome.i18n.getMessage('collectionCantBeDeleted', [activeCollection.userFriendlyName]);
            }

            this.ui.deleteButton.toggleClass('is-disabled', !canDelete).attr('title', deleteTitle);

            //  Add is disabled if all selected songs are already in the stream.
            //  A warning tooltip is shown if some of the selected songs are already in the stream.
            var canAdd = activeCollectionExists;
            var addTitle = '';

            if (canAdd) {
                var duplicatesInfo = this.streamItems.getDuplicatesInfo(activeCollection.getSelectedSongs());
                canAdd = !duplicatesInfo.allDuplicates;
                addTitle = duplicatesInfo.message;
            }
            
            this.ui.addButton.toggleClass('is-disabled', !canAdd).attr('title', addTitle);
        },
        
        _canDelete: function () {
            return activeCollection !== null && !activeCollection.isImmutable;
        },
        
        _canSave: function () {
            var signedIn = this.signInManager.get('signedInUser') !== null;
            var activeCollectionExists = this.model.get('activeCollection') !== null;
            
            return signedIn && activeCollectionExists;
        }
    });

    return SelectionBarView;
});