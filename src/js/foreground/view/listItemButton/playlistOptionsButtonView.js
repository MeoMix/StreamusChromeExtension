import {LayoutView} from 'marionette';
import ListItemButton from 'foreground/view/behavior/listItemButton';
import PlaylistActions from 'foreground/model/playlist/playlistActions';
import {listItemButton_optionsListItemButton as OptionsListItemButtonTemplate} from 'common/templates';
import {icon_optionsIcon_18 as OptionsIconTemplate} from 'common/templates';

var PlaylistOptionsButtonView = LayoutView.extend({
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

  playlist: null,

  initialize: function(options) {
    this.playlist = options.playlist;
  },

  onClick: function() {
    var offset = this.$el.offset();
    var playlistActions = new PlaylistActions();
    playlistActions.showContextMenu(this.playlist, offset.top, offset.left);
  }
});

export default PlaylistOptionsButtonView;