import _ from 'common/shim/lodash.reference.shim';
import ListItemView from 'foreground/view/listItemView';
import ListItemMultiSelect from 'foreground/view/behavior/itemViewMultiSelect';
import AddVideoButtonView from 'foreground/view/listItemButton/addVideoButtonView';
import PlayPauseVideoButtonView from 'foreground/view/listItemButton/playPauseVideoButtonView';
import SaveVideoButtonView from 'foreground/view/listItemButton/saveVideoButtonView';
import VideoOptionsButtonView from 'foreground/view/listItemButton/videoOptionsButtonView';
import VideoActions from 'foreground/model/video/videoActions';
import searchResultTemplate from 'template/search/searchResult.hbs!';

var SearchResultView = ListItemView.extend({
  className: ListItemView.prototype.className + ' search-result listItem--medium listItem--hasButtons listItem--selectable',
  template: searchResultTemplate,

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

export default SearchResultView;