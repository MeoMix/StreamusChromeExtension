'use strict';
import {LayoutView} from 'marionette';
import Tooltipable from 'foreground/view/behavior/tooltipable';
import ViewEntityContainer from 'foreground/view/behavior/viewEntityContainer';
import VideoActions from 'foreground/model/video/videoActions';
import SelectionBarTemplate from 'template/selectionBar/selectionBar.html!text';
import CloseIconTemplate from 'template/icon/closeIcon_24.svg!text';

var SelectionBarView = LayoutView.extend({
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
    playButton: 'playButton',
    addButton: 'addButton',
    saveButton: 'saveButton',
    deleteButton: 'deleteButton',
    selectionCountText: 'selectionCountText',
    clearButton: 'clearButton'
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
    ViewEntityContainer: {
      behaviorClass: ViewEntityContainer,
      viewEntityNames: ['model']
    }
  },

  onRender: function() {
    this._setSelectionCountText(this.model.get('selectedCount'));
    this._setButtonStates(this.model.get('activeCollection'));
  },

  _onClickClearButton: function() {
    StreamusFG.channels.listItem.commands.trigger('deselect:collection');
  },

  _onClickPlayButton: function() {
    var canPlay = this.model.get('canPlay');

    if (canPlay) {
      var selectedVideos = this.model.get('activeCollection').getSelectedVideos();
      this.model.get('streamItems').addVideos(selectedVideos, {
        playOnAdd: true
      });

      StreamusFG.channels.listItem.commands.trigger('deselect:collection');
    }
  },

  _onClickAddButton: function() {
    var canAdd = this.model.get('canAdd');

    if (canAdd) {
      var selectedVideos = this.model.get('activeCollection').getSelectedVideos();
      this.model.get('streamItems').addVideos(selectedVideos);

      StreamusFG.channels.listItem.commands.trigger('deselect:collection');
    }
  },

  _onClickSaveButton: function() {
    var canSave = this.model.get('canSave');

    if (canSave) {
      var videoActions = new VideoActions();
      var videos = this.model.get('activeCollection').getSelectedVideos();
      var offset = this.ui.saveButton.offset();
      var playlists = this.model.get('signInManager').get('signedInUser').get('playlists');

      videoActions.showSaveMenu(videos, offset.top, offset.left, playlists);

      // Don't deselect collections immediately when the button is clicked because more actions are needed.
      // If the user decides to not use the simple menu then don't de-select, either.
      this.listenTo(StreamusFG.channels.simpleMenu.vent, 'clicked:item', this._onSimpleMenuClickedItem);
      this.listenTo(StreamusFG.channels.simpleMenu.vent, 'hidden', this._onSimpleMenuHidden);
    }
  },

  _onClickDeleteButton: function() {
    var canDelete = this.model.get('canDelete');

    if (canDelete) {
      var selectedModels = this.model.get('activeCollection').getSelectedModels();
      _.invoke(selectedModels, 'destroy');

      StreamusFG.channels.listItem.commands.trigger('deselect:collection');
    }
  },

  _onSimpleMenuClickedItem: function() {
    StreamusFG.channels.listItem.commands.trigger('deselect:collection');
  },

  _onSimpleMenuHidden: function() {
    this.stopListening(StreamusFG.channels.simpleMenu.vent);
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

  // Update the text which shows how many videos are currently selected
  _setSelectionCountText: function(selectedCount) {
    var videosMessage = chrome.i18n.getMessage(selectedCount === 1 ? 'video' : 'videos');
    var selectionCountText = chrome.i18n.getMessage('collectionSelected', [selectedCount, videosMessage]);
    this.ui.selectionCountText.html(selectionCountText);

    // The tooltip might transition between 'cant add video' and 'cant add videos' depending on # of selections.
    this._setAddButtonState(this.model.get('canAdd'), this.model.get('activeCollection'));
  },

  // Set buttons to disabled when transitioning the view out as well as handle specific scenarios for each button
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
    var signedIn = this.model.get('signInManager').has('signedInUser');
    var tooltipText = signedIn ? '' : chrome.i18n.getMessage('notSignedIn');
    this.ui.saveButton.toggleClass('is-disabled', !canSave).attr('data-tooltip-text', tooltipText);
  },

  _setDeleteButtonState: function(canDelete, activeCollection) {
    // Delete is disabled if the user is selecting search results
    var tooltipText = '';

    if (!canDelete && !_.isNull(activeCollection)) {
      tooltipText = chrome.i18n.getMessage('collectionCantBeDeleted', [activeCollection.userFriendlyName]);
    }

    this.ui.deleteButton.toggleClass('is-disabled', !canDelete).attr('data-tooltip-text', tooltipText);
  },

  _setAddButtonState: function(canAdd, activeCollection) {
    // Add is disabled if all selected videos are already in the stream.
    // A warning tooltip is shown if some of the selected videos are already in the stream.
    var tooltipText = '';

    if (!_.isNull(activeCollection)) {
      var selectedVideos = activeCollection.getSelectedVideos();
      var duplicatesInfo = this.model.get('streamItems').getDuplicatesInfo(selectedVideos);
      tooltipText = duplicatesInfo.message;
    }

    this.ui.addButton.toggleClass('is-disabled', !canAdd).attr('data-tooltip-text', tooltipText);
  }
});

export default SelectionBarView;