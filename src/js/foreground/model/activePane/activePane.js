define(function(require) {
  'use strict';

  var ActivePaneType = require('foreground/enum/activePaneType');

  var ActivePane = Backbone.Model.extend({
    defaults: {
      type: ActivePaneType.None,
      relatedModel: null
    }
  });

  return ActivePane;
});