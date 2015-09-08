import {LayoutView} from 'marionette';
import ListItemButton from 'foreground/view/behavior/listItemButton';
import VideoActions from 'foreground/model/video/videoActions';
import {listItemButton_optionsListItemButton as OptionsListItemButtonTemplate} from 'common/templates';
import {icon_optionsIcon_18 as OptionsIconTemplate} from 'common/templates';

var VideoOptionsButtonView = LayoutView.extend({
  template: OptionsListItemButtonTemplate,
  templateHelpers: {
    optionsIcon: OptionsIconTemplate()
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