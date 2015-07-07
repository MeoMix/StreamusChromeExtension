define(function(require) {
  'use strict';

  var ActivePanesView = require('foreground/view/activePane/activePanesView');
  var ActivePanes = require('foreground/collection/activePane/activePanes');

  var ActivePaneRegion = Marionette.Region.extend({
    initialize: function() {
      this.listenTo(StreamusFG.channels.foregroundArea.vent, 'rendered', this._onForegroundAreaRendered);
    },

    _onForegroundAreaRendered: function() {
      this._showActivePanesView();
    },

    _showActivePanesView: function() {
      this.show(new ActivePanesView({
        collection: new ActivePanes(null, {
          stream: StreamusFG.backgroundProperties.stream,
          settings: StreamusFG.backgroundProperties.settings,
          activePlaylistManager: StreamusFG.backgroundProperties.activePlaylistManager
        })
      }));
    }
  });

  return ActivePaneRegion;
});