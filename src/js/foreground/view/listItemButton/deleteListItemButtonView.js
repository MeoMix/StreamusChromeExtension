'use strict';
import {LayoutView} from 'marionette';
import ListItemButton from 'foreground/view/behavior/listItemButton';
import DeleteListItemButtonTemplate from 'template/listItemButton/deleteListItemButton.html!text';
import DeleteIconTemplate from 'template/icon/deleteIcon_18.svg!text';

var DeleteListItemButtonView = LayoutView.extend({
  template: _.template(DeleteListItemButtonTemplate),
  templateHelpers: {
    deleteIcon: _.template(DeleteIconTemplate)()
  },

  behaviors: {
    ListItemButton: {
      behaviorClass: ListItemButton
    }
  },

  attributes: {
    'data-tooltip-text': chrome.i18n.getMessage('delete')
  },

  listItem: null,

  initialize: function(options) {
    this.listItem = options.listItem;
    // Ensure that the user isn't able to destroy the model more than once.
    this._deleteListItem = _.once(this._deleteListItem);
  },

  onClick: function() {
    this._deleteListItem();
  },

  _deleteListItem: function() {
    this.listItem.destroy();
  }
});

export default DeleteListItemButtonView;