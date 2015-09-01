'use strict';
import {Region} from 'marionette';
import AppBarView from 'foreground/view/appBar/appBarView';

var AppBarRegion = Region.extend({
  initialize: function() {
    this.listenTo(StreamusFG.channels.foregroundArea.vent, 'rendered', this._onForegroundAreaRendered);
  },

  _onForegroundAreaRendered: function() {
    this.show(new AppBarView({
      signInManager: StreamusFG.backgroundProperties.signInManager
    }));
  }
});

export default AppBarRegion;