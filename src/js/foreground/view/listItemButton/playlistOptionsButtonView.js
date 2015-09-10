import {LayoutView} from 'marionette';
import ListItemButton from 'foreground/view/behavior/listItemButton';
import PlaylistActions from 'foreground/model/playlist/playlistActions';
import optionsListItemButtonTemplate from 'template/listItemButton/optionsListItemButton.hbs!';
import optionsIconTemplate from 'template/icon/optionsIcon_18.hbs!';

var PlaylistOptionsButtonView = LayoutView.extend({
  template: optionsListItemButtonTemplate,
  templateHelpers: {
    optionsIcon: optionsIconTemplate
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