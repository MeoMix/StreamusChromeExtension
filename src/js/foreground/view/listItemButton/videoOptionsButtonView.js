define(function(require) {
  'use strict';

  var ListItemButton = require('foreground/view/behavior/listItemButton');
  var VideoActions = require('foreground/model/video/videoActions');
  var OptionsListItemButtonTemplate = require('text!template/listItemButton/optionsListItemButton.html');
  var OptionsIconTemplate = require('text!template/icon/optionsIcon_18.svg');

  var VideoOptionsButtonView = Marionette.LayoutView.extend({
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

  return VideoOptionsButtonView;
});