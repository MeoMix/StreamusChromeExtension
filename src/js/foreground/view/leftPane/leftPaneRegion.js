define(function(require) {
  'use strict';

  var LeftPaneView = require('foreground/view/leftPane/leftPaneView');

  var LeftPaneRegion = Marionette.Region.extend({
    settings: null,

    initialize: function(options) {
      this.settings = options.settings;
      this.listenTo(StreamusFG.channels.foregroundArea.vent, 'rendered', this._onForegroundAreaRendered);
      this.listenTo(StreamusFG.channels.foregroundArea.vent, 'idle', this._onForegroundAreaIdle);
    },

    _onForegroundAreaRendered: function() {
      if (!this.settings.get('openToSearch')) {
        this._showLeftPaneView();
      }
    },

    _onForegroundAreaIdle: function() {
      // If search is being shown immediately then its OK to defer loading to improve initial
      // load performance.
      if (this.settings.get('openToSearch')) {
        this._showLeftPaneView();
      }
    },

    _showLeftPaneView: function() {
      if (!this.hasView()) {
        this.show(new LeftPaneView({
          signInManager: StreamusFG.backgroundPage.signInManager
        }));
      }
    }
  });

  return LeftPaneRegion;
});