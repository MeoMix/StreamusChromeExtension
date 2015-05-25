define(function(require) {
  'use strict';

  var Tooltipable = require('foreground/view/behavior/tooltipable');
  var SongActions = require('foreground/model/song/songActions');
  var ViewModelContainer = require('foreground/view/behavior/viewModelContainer');
  var SaveIconTemplate = require('text!template/icon/saveIcon_18.svg');
  var SaveStreamButtonTemplate = require('text!template/stream/saveStreamButton.html');

  var SaveStreamButtonView = Marionette.ItemView.extend({
    id: 'saveStreamButton',
    className: 'button button--icon button--icon--secondary button--medium',
    template: _.template(SaveStreamButtonTemplate),
    templateHelpers: {
      saveIcon: _.template(SaveIconTemplate)()
    },

    attributes: {
      'data-ui': 'tooltipable'
    },

    events: {
      'click': '_onClick'
    },

    modelEvents: {
      'change:enabled': '_onChangeEnabled'
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
      this._setState(this.model.get('enabled'), this.model.getStateMessage());
    },

    _onClick: function() {
      if (this.model.get('enabled')) {
        var songs = this.model.get('streamItems').pluck('song');
        this._showSaveSongsSimpleMenu(songs);
      }
    },

    _onChangeEnabled: function(model, enabled) {
      this._setState(enabled, model.getStateMessage());
    },

    _setState: function(enabled, stateMessage) {
      this.$el.toggleClass('is-disabled', !enabled).attr('data-tooltip-text', stateMessage);
    },

    _showSaveSongsSimpleMenu: function(songs) {
      var songActions = new SongActions();
      var offset = this.$el.offset();
      var playlists = this.model.get('signInManager').get('signedInUser').get('playlists');

      songActions.showSaveMenu(songs, offset.top, offset.left, playlists);
    }
  });

  return SaveStreamButtonView;
});