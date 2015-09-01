'use strict';
import {Region} from 'marionette';
import ActivePanesView from 'foreground/view/activePane/activePanesView';
import ActivePanes from 'foreground/collection/activePane/activePanes';

var ActivePaneRegion = Region.extend({
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

export default ActivePaneRegion;