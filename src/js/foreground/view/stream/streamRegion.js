define(function(require) {
  'use strict';

  var StreamView = require('foreground/view/stream/streamView');

  var StreamRegion = Marionette.Region.extend({
    initialize: function() {
      this.listenTo(StreamusFG.channels.foregroundArea.vent, 'rendered', this._onForegroundAreaRendered);
    },

    _onForegroundAreaRendered: function() {
      this.show(new StreamView({
        model: StreamusFG.backgroundPage.stream
      }));
    }
  });

  return StreamRegion;
});