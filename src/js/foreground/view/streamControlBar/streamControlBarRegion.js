define(function(require) {
  'use strict';
  // TODO: Naming? Should this be PlayerControlBarView?
  var StreamControlBarView = require('foreground/view/streamControlBar/streamControlBarView');

  var StreamControlBarRegion = Marionette.Region.extend({
    initialize: function() {
      this.listenTo(StreamusFG.channels.foregroundArea.vent, 'rendered', this._onForegroundAreaRendered);
    },

    _onForegroundAreaRendered: function() {
      this.show(new StreamControlBarView({
        player: StreamusFG.backgroundProperties.player
      }));
    }
  });

  return StreamControlBarRegion;
});