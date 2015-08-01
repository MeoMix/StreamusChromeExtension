define(function(require) {
  'use strict';

  var ListItemView = require('foreground/view/listItemView');
  var ListItemMultiSelect = require('foreground/view/behavior/itemViewMultiSelect');
  var SpinnerView = require('foreground/view/element/spinnerView');
  var AddVideoButtonView = require('foreground/view/listItemButton/addVideoButtonView');
  var DeleteListItemButtonView = require('foreground/view/listItemButton/deleteListItemButtonView');
  var PlayPauseVideoButtonView = require('foreground/view/listItemButton/playPauseVideoButtonView');
  var VideoOptionsButtonView = require('foreground/view/listItemButton/videoOptionsButtonView');
  var PlaylistItemTemplate = require('text!template/leftPane/playlistItem.html');
  var Tooltipable = require('foreground/view/behavior/tooltipable');
  var VideoActions = require('foreground/model/video/videoActions');

  var PlaylistItemView = ListItemView.extend({
    className: ListItemView.prototype.className + ' playlist-item listItem--medium listItem--hasButtons listItem--selectable',
    template: _.template(PlaylistItemTemplate),

    events: _.extend({}, ListItemView.prototype.events, {
      'dblclick': '_onDblClick'
    }),

    modelEvents: {
      'change:id': '_onChangeId'
    },

    behaviors: _.extend({}, ListItemView.prototype.behaviors, {
      ListItemMultiSelect: {
        behaviorClass: ListItemMultiSelect
      },
      Tooltipable: {
        behaviorClass: Tooltipable
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
        AddVideoButtonView: {
          viewClass: AddVideoButtonView,
          video: this.model.get('video'),
          streamItems: StreamusFG.backgroundProperties.stream.get('items')
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

    streamItems: null,
    player: null,

    initialize: function(options) {
      this.streamItems = options.streamItems;
      this.player = options.player;
    },

    onRender: function() {
      this._setShowingSpinnerClass();
    },

    showContextMenu: function(top, left) {
      var video = this.model.get('video');
      var videoActions = new VideoActions();

      videoActions.showContextMenu(video, top, left, this.player);
    },

    _onDblClick: function() {
      this._playInStream();
    },

    _onChangeId: function(model, id) {
      this._setDataId(id);
      this._setShowingSpinnerClass();
    },

    // If the playlistItem hasn't been successfully saved to the server -- show a spinner over the UI.
    _setShowingSpinnerClass: function() {
      var isShowingSpinner = this.model.isNew();

      // Prefer lazy-loading the SpinnerView to not take a perf hit if the view isn't loading.
      if (isShowingSpinner && !this.getRegion('spinner').hasView()) {
        this.showChildView('spinner', new SpinnerView({
          className: 'overlay u-marginAuto'
        }));
      }

      this.$el.toggleClass('is-showingSpinner', isShowingSpinner);
    },

    _setDataId: function(id) {
      this.$el.attr('data-id', id);
    },

    _playInStream: function() {
      this.streamItems.addVideos(this.model.get('video'), {
        playOnAdd: true
      });
    }
  });

  return PlaylistItemView;
});