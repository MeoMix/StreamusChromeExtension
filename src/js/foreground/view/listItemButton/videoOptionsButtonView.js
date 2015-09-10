import {LayoutView} from 'marionette';
import ListItemButton from 'foreground/view/behavior/listItemButton';
import VideoActions from 'foreground/model/video/videoActions';
import OptionsListItemButtonTemplate from 'template/listItemButton/optionsListItemButton.hbs!';
import OptionsIconTemplate from 'template/icon/optionsIcon_18.hbs!';

var VideoOptionsButtonView = LayoutView.extend({
  template: OptionsListItemButtonTemplate,
  templateHelpers: {
    optionsIcon: OptionsIconTemplate
  },

  attributes: {
    'data-tooltip-text': chrome.i18n.getMessage('moreOptions')
  },

  behaviors: {
    ListItemButton: {
      behaviorClass: ListItemButton
    }
  },

  video: null,
  player: null,

  initialize: function(options) {
    this.video = options.video;
    this.player = options.player;
  },

  onClick: function() {
    var offset = this.$el.offset();
    var videoActions = new VideoActions();
    videoActions.showContextMenu(this.video, offset.top, offset.left, this.player);
  }
});

export default VideoOptionsButtonView;