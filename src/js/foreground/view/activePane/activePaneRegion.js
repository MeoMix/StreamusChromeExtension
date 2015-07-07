define(function(require) {
  'use strict';

  var ActivePaneView = require('foreground/view/activePane/activePaneView');
  var Panes = require('foreground/collection/activePane/panes');

  var ActivePaneRegion = Marionette.Region.extend({
    initialize: function() {
      this.listenTo(StreamusFG.channels.foregroundArea.vent, 'rendered', this._onForegroundAreaRendered);
    },

    _onForegroundAreaRendered: function() {
      this._showActivePaneView();
    },

    _showActivePaneView: function() {
      this.show(new ActivePaneView({
        collection: new Panes(null, {
          stream: StreamusFG.backgroundProperties.stream,
          settings: StreamusFG.backgroundProperties.settings,
          activePlaylistManager: StreamusFG.backgroundProperties.activePlaylistManager
        })
      }));
    }
  });

  return ActivePaneRegion;
});