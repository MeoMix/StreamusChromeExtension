define(function(require) {
  'use strict';

  var Tooltipable = require('foreground/view/behavior/tooltipable');
  var VideoActions = require('foreground/model/video/videoActions');
  var ViewModelContainer = require('foreground/view/behavior/viewModelContainer');
  var SaveStreamButtonTemplate = require('text!template/stream/saveStreamButton.html');

  var SaveStreamButtonView = Marionette.LayoutView.extend({
    id: 'saveStreamButton',
    className: 'button button--flat',
    template: _.template(SaveStreamButtonTemplate),
    templateHelpers: {
      saveAllMessage: chrome.i18n.getMessage('saveAll')
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
        var videos = this.model.get('streamItems').pluck('video');
        this._showSaveVideosSimpleMenu(videos);
      }
    },

    _onChangeEnabled: function(model, enabled) {
      this._setState(enabled, model.getStateMessage());
    },

    _setState: function(enabled, stateMessage) {
      this.$el.toggleClass('is-disabled', !enabled).attr('data-tooltip-text', stateMessage);
    },

    _showSaveVideosSimpleMenu: function(videos) {
      var videoActions = new VideoActions();
      var offset = this.$el.offset();
      var playlists = this.model.get('signInManager').get('signedInUser').get('playlists');

      videoActions.showSaveMenu(videos, offset.top, offset.left, playlists);
    }
  });

  return SaveStreamButtonView;
});