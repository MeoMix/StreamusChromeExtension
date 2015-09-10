import {LayoutView} from 'marionette';
import ListItemButton from 'foreground/view/behavior/listItemButton';
import addListItemButtonTemplate from 'template/listItemButton/addListItemButton.hbs!';
import addIconTemplate from 'template/icon/addIcon_18.hbs!';

var AddVideoButtonView = LayoutView.extend({
  template: addListItemButtonTemplate,
  templateHelpers: {
    addIcon: addIconTemplate
  },

  behaviors: {
    ListItemButton: {
      behaviorClass: ListItemButton
    }
  },

  streamItems: null,
  streamItemsEvents: {
    'add:completed': '_onStreamItemsAddCompleted',
    'remove': '_onStreamItemsRemove',
    'reset': '_onStreamItemsReset'
  },

  video: null,

  initialize: function(options) {
    this.video = options.video;
    this.streamItems = options.streamItems;
    this.bindEntityEvents(this.streamItems, this.streamItemsEvents);
  },

  onRender: function() {
    this._setState();
  },

  onClick: function() {
    this.streamItems.addVideos(this.video);
  },

  _onStreamItemsAddCompleted: function() {
    this._setState();
  },

  _onStreamItemsRemove: function() {
    this._setState();
  },

  _onStreamItemsReset: function() {
    this._setState();
  },

  _setState: function() {
    var duplicatesInfo = this.streamItems.getDuplicatesInfo(this.video);
    this.$el.toggleClass('is-disabled', duplicatesInfo.allDuplicates);
    this.model.set('enabled', !duplicatesInfo.allDuplicates);

    var tooltipText = duplicatesInfo.allDuplicates ? duplicatesInfo.message : chrome.i18n.getMessage('add');
    this.$el.attr('data-tooltip-text', tooltipText);
  }
});

export default AddVideoButtonView;