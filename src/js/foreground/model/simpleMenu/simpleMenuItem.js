define(function(require) {
  'use strict';

  var FixedPosition = require('foreground/enum/fixedPosition');

  var SimpleMenuItem = Backbone.Model.extend({
    defaults: {
      text: '',
      value: null,
      active: false,
      disabled: false,
      fixedPosition: FixedPosition.None,
      onClick: _.noop
    }
  });

  return SimpleMenuItem;
});