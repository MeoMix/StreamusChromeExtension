define(function(require) {
  'use strict';

  var ListItemView = require('foreground/view/listItemView');
  var ListItemMultiSelect = require('foreground/view/behavior/itemViewMultiSelect');
  var DeleteListItemButtonView = require('foreground/view/listItemButton/deleteListItemButtonView');
  var PlayPauseVideoButtonView = require('foreground/view/listItemButton/playPauseVideoButtonView');
  var SaveVideoButtonView = require('foreground/view/listItemButton/saveVideoButtonView');
  var VideoOptionsButtonView = require('foreground/view/listItemButton/videoOptionsButtonView');
  var StreamItemTemplate = require('text!template/stream/streamItem.html');
  var VideoActions = require('foreground/model/video/videoActions');

  var StreamItemView = ListItemView.extend({
    className: ListItemView.prototype.className + ' stream-item listItem--medium listItem--hasButtons listItem--selectable',
    template: _.template(StreamItemTemplate),

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

  return StreamItemView;
});