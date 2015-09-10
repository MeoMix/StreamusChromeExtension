import _ from 'common/shim/lodash.reference.shim';
import ListItemView from 'foreground/view/listItemView';
import ListItemMultiSelect from 'foreground/view/behavior/itemViewMultiSelect';
import DeleteListItemButtonView from 'foreground/view/listItemButton/deleteListItemButtonView';
import PlayPauseVideoButtonView from 'foreground/view/listItemButton/playPauseVideoButtonView';
import SaveVideoButtonView from 'foreground/view/listItemButton/saveVideoButtonView';
import VideoOptionsButtonView from 'foreground/view/listItemButton/videoOptionsButtonView';
import VideoActions from 'foreground/model/video/videoActions';
import streamItemTemplate from 'template/stream/streamItem.hbs!';

var StreamItemView = ListItemView.extend({
  className: ListItemView.prototype.className + ' stream-item listItem--medium listItem--hasButtons listItem--selectable',
  template: streamItemTemplate,

  events: _.extend({}, ListItemView.prototype.events, {
    'dblclick': '_onDblClick'
  }),

  modelEvents: {
    'change:id': '_onChangeId',
    'change:active': '_onChangeActive'
  },

  behaviors: _.extend({}, ListItemView.prototype.behaviors, {
    ListItemMultiSelect: {
      behaviorClass: ListItemMultiSelect
    }
  }),

  buttonViewOptions: function() {
    return {
      PlayPauseVideoButtonView: {
        viewClass: PlayPauseVideoButtonView,
        video: this.model.get('video'),
        streamItems: StreamusFG.backgroundProperties.stream.get('items'),
        player: StreamusFG.backgroundProperties.player
      },
      SaveVideoButtonView: {
        viewClass: SaveVideoButtonView,
        video: this.model.get('video'),
        signInManager: StreamusFG.backgroundProperties.signInManager
      },
      DeleteListItemButtonView: {
        viewClass: DeleteListItemButtonView,
        listItem: this.model
      },
      VideoOptionsButtonView: {
        viewClass: VideoOptionsButtonView,
        video: this.model.get('video'),
        player: this.player
      }
    };
  },

  player: null,
  playPauseButton: null,

  initialize: function(options) {
    this.player = options.player;
    this.playPauseButton = options.playPauseButton;
  },

  onRender: function() {
    this._setActiveClass(this.model.get('active'));
  },

  showContextMenu: function(top, left) {
    var videoActions = new VideoActions();
    var video = this.model.get('video');

    videoActions.showContextMenu(video, top, left, this.player);
  },

  _onDblClick: function() {
    if (this.model.get('active')) {
      this.playPauseButton.tryTogglePlayerState();
    } else {
      this.player.set('playOnActivate', true);
      this.model.save({
        active: true
      });
    }
  },

  _onChangeId: function(model, id) {
    this.$el.attr('data-id', id);
  },

  _onChangeActive: function(model, active) {
    this._setActiveClass(active);
  },

  // Force the view to reflect the model's active class. It's important to do this here, and not through render always, because
  // render will cause the lazy-loaded image to be reset.
  _setActiveClass: function(active) {
    this.$el.toggleClass('is-active', active);
  }
});

export default StreamItemView;