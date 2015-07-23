define(function(require) {
  'use strict';

  var ClipboardRegion = require('background/view/clipboardRegion');
  var BackgroundAreaTemplate = require('text!template/backgroundArea.html');

  var BackgroundAreaView = Marionette.LayoutView.extend({
    el: '#backgroundArea',
    template: _.template(BackgroundAreaTemplate),

    regions: {
      clipboard: {
        el: '[data-region=clipboard]',
        regionClass: ClipboardRegion
      }
    },

    initialize: function() {
      this.model.get('analyticsManager').sendPageView('/background.html');
    },

    onRender: function() {
      StreamusBG.channels.backgroundArea.vent.trigger('rendered');
    }
  });

  return BackgroundAreaView;
});