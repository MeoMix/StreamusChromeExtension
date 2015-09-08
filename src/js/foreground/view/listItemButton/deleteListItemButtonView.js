import _ from 'common/shim/lodash.reference.shim';
import {LayoutView} from 'marionette';
import ListItemButton from 'foreground/view/behavior/listItemButton';
import {listItemButton_deleteListItemButton as DeleteListItemButtonTemplate} from 'common/templates';
import {icon_deleteIcon_18 as DeleteIconTemplate} from 'common/templates';

var DeleteListItemButtonView = LayoutView.extend({
  template: DeleteListItemButtonTemplate,
  templateHelpers: {
    deleteIcon: DeleteIconTemplate()
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