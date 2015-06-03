define(function(require) {
  'use strict';

  var DialogContent = require('foreground/view/behavior/dialogContent');
  var DeletePlaylistTemplate = require('text!template/dialog/deletePlaylist.html');

  var DeletePlaylistView = Marionette.LayoutView.extend({
    template: _.template(DeletePlaylistTemplate),

    templateHelpers: {
      deleteMessage: chrome.i18n.getMessage('delete')
    },

    behaviors: {
      DialogContent: {
        behaviorClass: DialogContent
      }
    },

    deletePlaylist: function() {
      this.model.destroy();
    }
  });

  return DeletePlaylistView;
});