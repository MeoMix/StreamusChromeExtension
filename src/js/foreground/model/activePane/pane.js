define(function(require) {
  'use strict';

  var PaneType = require('foreground/enum/paneType');

  var Pane = Backbone.Model.extend({
    defaults: {
      isVisible: false,
      type: PaneType.None,
      relatedModel: null
    }
  });

  return Pane;
});