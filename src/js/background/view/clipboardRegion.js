'use strict';
import {Region} from 'marionette';
import ClipboardView from 'background/view/clipboardView';

var ClipboardRegion = Region.extend({
  initialize: function() {
    this.listenTo(StreamusBG.channels.backgroundArea.vent, 'rendered', this._onBackgroundAreaRendered);
  },

  _onBackgroundAreaRendered: function() {
    this._showClipboardView();
  },

  _showClipboardView: function() {
    var clipboardView = new ClipboardView();
    this.show(clipboardView);
  }
});

export default ClipboardRegion;