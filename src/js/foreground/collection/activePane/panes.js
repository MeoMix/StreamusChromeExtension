define(function(require) {
  'use strict';

  var Pane = require('foreground/model/pane');

  var Panes = Backbone.Collection.extend({
    model: Pane
  });

  return Panes;
});