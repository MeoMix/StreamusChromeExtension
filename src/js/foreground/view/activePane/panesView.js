define(function(require) {
  'use strict';

  //var PaneView = require('foreground/view/activePane/paneView');
  var PaneType = require('foreground/enum/paneType');
  var StreamView = require('foreground/view/stream/streamView');
  var ActivePlaylistAreaView = require('foreground/view/leftPane/activePlaylistAreaView');

  var PanesView = Marionette.CollectionView.extend({
    template: _.template(''),

    getChildView: function(model) {
      var ChildView = null;
      var paneType = model.get('paneType');

      switch(paneType) {
        case PaneType.Stream:
          ChildView = StreamView;
          break;
        case PaneType.Playlist:
          ChildView = ActivePlaylistAreaView;
          break;
        default:
          // TODO: Log error
          console.error('Unhandled pane type ' + paneType);
      }

      return ChildView;
    }
  });

  return PanesView;
});