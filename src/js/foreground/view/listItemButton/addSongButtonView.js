define(function(require) {
  'use strict';

  var ListItemButton = require('foreground/view/behavior/listItemButton');
  var AddListItemButtonTemplate = require('text!template/listItemButton/addListItemButton.html');
  var AddIconTemplate = require('text!template/icon/addIcon_18.svg');

  var AddSongButtonView = Marionette.ItemView.extend({
    template: _.template(AddListItemButtonTemplate),
    templateHelpers: {
      addIcon: _.template(AddIconTemplate)()
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

    song: null,

    initialize: function(options) {
      this.song = options.song;
      this.streamItems = options.streamItems;
      this.bindEntityEvents(this.streamItems, this.streamItemsEvents);
    },

    onRender: function() {
      this._setState();
    },

    onClick: function() {
      this.streamItems.addSongs(this.song);
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
      var duplicatesInfo = this.streamItems.getDuplicatesInfo(this.song);
      this.$el.toggleClass('is-disabled', duplicatesInfo.allDuplicates);
      this.model.set('enabled', !duplicatesInfo.allDuplicates);

      var tooltipText = duplicatesInfo.allDuplicates ? duplicatesInfo.message : chrome.i18n.getMessage('add');
      this.$el.attr('data-tooltip-text', tooltipText);
    }
  });

  return AddSongButtonView;
});