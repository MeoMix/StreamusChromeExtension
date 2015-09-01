'use strict';
import {Region} from 'marionette';
import StreamControlBarView from 'foreground/view/streamControlBar/streamControlBarView';

var StreamControlBarRegion = Region.extend({
  initialize: function() {
    this.listenTo(StreamusFG.channels.foregroundArea.vent, 'rendered', this._onForegroundAreaRendered);
  },

  _onForegroundAreaRendered: function() {
    this.show(new StreamControlBarView({
      player: StreamusFG.backgroundProperties.player
    }));
  }
});

export default StreamControlBarRegion;