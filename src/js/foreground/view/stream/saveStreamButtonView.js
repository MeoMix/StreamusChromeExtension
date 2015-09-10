import {LayoutView} from 'marionette';
import Tooltipable from 'foreground/view/behavior/tooltipable';
import VideoActions from 'foreground/model/video/videoActions';
import ViewEntityContainer from 'foreground/view/behavior/viewEntityContainer';
import saveStreamButtonTemplate from 'template/stream/saveStreamButton.hbs!';

var SaveStreamButtonView = LayoutView.extend({
  id: 'saveStreamButton',
  className: 'button button--flat',
  template: saveStreamButtonTemplate,

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
    ViewEntityContainer: {
      behaviorClass: ViewEntityContainer,
      viewEntityNames: ['model']
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

export default SaveStreamButtonView;