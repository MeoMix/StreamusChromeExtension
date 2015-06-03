define(function(require) {
  'use strict';

  var Switch = require('foreground/model/element/switch');

  var Switches = Backbone.Collection.extend({
    model: Switch
  });

  return Switches;
});