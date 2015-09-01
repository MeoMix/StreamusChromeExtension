'use strict';
import {LayoutView} from 'marionette';
import ListItemButton from 'foreground/view/behavior/listItemButton';
import PlaylistActions from 'foreground/model/playlist/playlistActions';
import OptionsListItemButtonTemplate from 'template/listItemButton/optionsListItemButton.html!text';
import OptionsIconTemplate from 'template/icon/optionsIcon_18.svg!text';

var PlaylistOptionsButtonView = LayoutView.extend({
  template: _.template(OptionsListItemButtonTemplate),
  templateHelpers: {
    optionsIcon: _.template(OptionsIconTemplate)()
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