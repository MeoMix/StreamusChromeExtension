define(function(require) {
  'use strict';

  var ActivePaneView = require('foreground/view/activePane/activePaneView');

  var ActivePaneRegion = Marionette.Region.extend({
    initialize: function() {
      this.listenTo(StreamusFG.channels.foregroundArea.vent, 'rendered', this._onForegroundAreaRendered);
    },

    _onForegroundAreaRendered: function() {
      this._showActivePaneView();
    },

    _showActivePaneView: function() {
      this.show(new ActivePaneView({
        activePlaylistManager: StreamusFG.backgroundProperties.activePlaylistManager
      }));
    }
  });

  return ActivePaneRegion;
});