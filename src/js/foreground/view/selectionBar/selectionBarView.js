define(function(require) {
    'use strict';

    var Tooltipable = require('foreground/view/behavior/tooltipable');
    var ViewModelContainer = require('foreground/view/behavior/viewModelContainer');
    var SongActions = require('foreground/model/song/songActions');
    var SelectionBarTemplate = require('text!template/selectionBar/selectionBar.html');
    var CloseIconTemplate = require('text!template/icon/closeIcon_24.svg');

    var SelectionBarView = Marionette.ItemView.extend({
        id: 'selectionBar',
        className: 'selectionBar panel-content panel-content--uncolored',
        template: _.template(SelectionBarTemplate),

        templateHelpers: {
            playMessage: chrome.i18n.getMessage('play'),
            addMessage: chrome.i18n.getMessage('add'),
            saveMessage: chrome.i18n.getMessage('save'),
            deleteMessage: chrome.i18n.getMessage('delete'),
            closeIcon: _.template(CloseIconTemplate)()
        },

        ui: {
            playButton: '[data-ui~=playButton]',
            addButton: '[data-ui~=addButton]',
            saveButton: '[data-ui~=saveButton]',
            deleteButton: '[data-ui~=deleteButton]',
            selectionCountText: '[data-ui~=selectionCountText]',
            clearButton: '[data-ui~=clearButton]'
        },

        events: {
            'click @ui.playButton': '_onClickPlayButton',
            'click @ui.addButton': '_onClickAddButton',
            'click @ui.saveButton': '_onClickSaveButton',
            'click @ui.deleteButton': '_onClickDeleteButton',
            'click @ui.clearButton': '_onClickClearButton'
        },

        modelEvents: {
            'change:canAdd': '_onChangeCanAdd',
            'change:canSave': '_onChangeCanSave',
            'change:canPlay': '_onChangeCanPlay',
            'change:canDelete': '_onChangeCanDelete',
            'change:activeCollection': '_onChangeActiveCollection',
            'change:selectedCount': '_onChangeSelectedCount'
        },

        behaviors: {
            Tooltipable: {
                behaviorClass: Tooltipable
            },
            ViewModelContainer: {
                behaviorClass: ViewModelContainer,
                viewModelNames: ['model']
            }
        },

        onRender: function() {
            this._setSelectionCountText(this.model.get('selectedCount'));
            this._setButtonStates(this.model.get('activeCollection'));
        },

        _onClickClearButton: function() {
            Streamus.channels.listItem.commands.trigger('deselect:collection');
        },

        _onClickPlayButton: function() {
            var canPlay = this.model.get('canPlay');

            if (canPlay) {
                var selectedSongs = this.model.get('activeCollection').getSelectedSongs();
                this.model.get('streamItems').addSongs(selectedSongs, {
                    playOnAdd: true
                });

                Streamus.channels.listItem.commands.trigger('deselect:collection');
            }
        },

        _onClickAddButton: function() {
            var canAdd = this.model.get('canAdd');

            if (canAdd) {
                var selectedSongs = this.model.get('activeCollection').getSelectedSongs();
                this.model.get('streamItems').addSongs(selectedSongs);

                Streamus.channels.listItem.commands.trigger('deselect:collection');
            }
        },

        _onClickSaveButton: function() {
            var canSave = this.model.get('canSave');

            if (canSave) {
                var songActions = new SongActions();
                var songs = this.model.get('activeCollection').getSelectedSongs();
                var offset = this.ui.saveButton.offset();
                var playlists = this.model.get('signInManager').get('signedInUser').get('playlists');

                songActions.showSaveMenu(songs, offset.top, offset.left, playlists);

                //  Don't deselect collections immediately when the button is clicked because more actions are needed.
                //  If the user decides to not use the simple menu then don't de-select, either.
                this.listenTo(Streamus.channels.simpleMenu.vent, 'clicked:item', this._onSimpleMenuClickedItem);
                this.listenTo(Streamus.channels.simpleMenu.vent, 'hidden', this._onSimpleMenuHidden);
            }
        },

        _onClickDeleteButton: function() {
            var canDelete = this.model.get('canDelete');

            if (canDelete) {
                var selectedModels = this.model.get('activeCollection').selected();
                _.invoke(selectedModels, 'destroy');

                Streamus.channels.listItem.commands.trigger('deselect:collection');
            }
        },

        _onSimpleMenuClickedItem: function() {
            Streamus.channels.listItem.commands.trigger('deselect:collection');
        },

        _onSimpleMenuHidden: function() {
            this.stopListening(Streamus.channels.simpleMenu.vent);
        },

        _onChangeCanAdd: function(model, canAdd) {
            this._setAddButtonState(canAdd, this.model.get('activeCollection'));
        },

        _onChangeCanSave: function(model, canSave) {
            this._setSaveButtonState(canSave);
        },

        _onChangeCanDelete: function(model, canDelete) {
            this._setDeleteButtonState(canDelete, this.model.get('activeCollection'));
        },

        _onChangeCanPlay: function(model, canPlay) {
            this._setPlayButtonState(canPlay);
        },

        _onChangeSelectedCount: function(model, selectedCount) {
            this._setSelectionCountText(selectedCount);
        },

        _onChangeActiveCollection: function(model, activeCollection) {
            this._setAddButtonState(this.model.get('canAdd'), activeCollection);
            this._setDeleteButtonState(this.model.get('canDelete'), activeCollection);
        },

        //  Update the text which shows how many songs are currently selected
        _setSelectionCountText: function(selectedCount) {
            var selectionCountText = chrome.i18n.getMessage('collectionSelected', [selectedCount, chrome.i18n.getMessage(selectedCount === 1 ? 'song' : 'songs')]);
            this.ui.selectionCountText.html(selectionCountText);

            //  The tooltip might transition between 'cant add song' and 'cant add songs' depending on # of selections.
            this._setAddButtonState(this.model.get('canAdd'), this.model.get('activeCollection'));
        },

        //  Set buttons to disabled when transitioning the view out as well as handle specific scenarios for each button
        _setButtonStates: function(activeCollection) {
            this._setPlayButtonState(this.model.get('canPlay'));
            this._setSaveButtonState(this.model.get('canSave'));
            this._setDeleteButtonState(this.model.get('canDelete'), activeCollection);
            this._setAddButtonState(this.model.get('canAdd'), activeCollection);
        },

        _setPlayButtonState: function(canPlay) {
            this.ui.playButton.toggleClass('is-disabled', !canPlay);
        },

        _setSaveButtonState: function(canSave) {
            var signedIn = this.model.get('signInManager').get('signedInUser') !== null;
            var tooltipText = signedIn ? '' : chrome.i18n.getMessage('notSignedIn');
            this.ui.saveButton.toggleClass('is-disabled', !canSave).attr('data-tooltip-text', tooltipText);
        },

        _setDeleteButtonState: function(canDelete, activeCollection) {
            //  Delete is disabled if the user is selecting search results
            var tooltipText = '';

            if (!canDelete && activeCollection !== null) {
                tooltipText = chrome.i18n.getMessage('collectionCantBeDeleted', [activeCollection.userFriendlyName]);
            }

            this.ui.deleteButton.toggleClass('is-disabled', !canDelete).attr('data-tooltip-text', tooltipText);
        },

        _setAddButtonState: function(canAdd, activeCollection) {
            //  Add is disabled if all selected songs are already in the stream.
            //  A warning tooltip is shown if some of the selected songs are already in the stream.
            var tooltipText = '';

            if (activeCollection !== null) {
                var selectedSongs = activeCollection.getSelectedSongs();
                var duplicatesInfo = this.model.get('streamItems').getDuplicatesInfo(selectedSongs);
                tooltipText = duplicatesInfo.message;
            }

            this.ui.addButton.toggleClass('is-disabled', !canAdd).attr('data-tooltip-text', tooltipText);
        }
    });

    return SelectionBarView;
});