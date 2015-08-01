define(function(require) {
  'use strict';

  var ListItemView = require('foreground/view/listItemView');
  var ListItemMultiSelect = require('foreground/view/behavior/itemViewMultiSelect');
  var AddVideoButtonView = require('foreground/view/listItemButton/addVideoButtonView');
  var PlayPauseVideoButtonView = require('foreground/view/listItemButton/playPauseVideoButtonView');
  var SaveVideoButtonView = require('foreground/view/listItemButton/saveVideoButtonView');
  var VideoOptionsButtonView = require('foreground/view/listItemButton/videoOptionsButtonView');
  var SearchResultTemplate = require('text!template/search/searchResult.html');
  var VideoActions = require('foreground/model/video/videoActions');

  var SearchResultView = ListItemView.extend({
    className: ListItemView.prototype.className + ' search-result listItem--medium listItem--hasButtons listItem--selectable',
    template: _.template(SearchResultTemplate),

    events: _.extend({}, ListItemView.prototype.events, {
      'dblclick': '_onDblClick'
    }),

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
        AddVideoButtonView: {
          viewClass: AddVideoButtonView,
          video: this.model.get('video'),
          streamItems: StreamusFG.backgroundProperties.stream.get('items')
        },
        SaveVideoButtonView: {
          viewClass: SaveVideoButtonView,
          video: this.model.get('video'),
          signInManager: StreamusFG.backgroundProperties.signInManager
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

    showContextMenu: function(top, left) {
      var videoActions = new VideoActions();
      var video = this.model.get('video');

      videoActions.showContextMenu(video, top, left, this.player);
    },

    _onDblClick: function() {
      this._playInStream();
    },

    _playInStream: function() {
      this.streamItems.addVideos(this.model.get('video'), {
        playOnAdd: true
      });
    }
  });

  return SearchResultView;
});