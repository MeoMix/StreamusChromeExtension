define(function(require) {
  'use strict';

  var Scrollable = require('foreground/view/behavior/scrollable');

  var DialogContent = Marionette.Behavior.extend({
    behaviors: {
      Scrollable: {
        behaviorClass: Scrollable
      }
    },

    onRender: function() {
      // Prefer to do this in initialize, but $el isn't available to Behavior until after view's initialize.
      this.$el.addClass('dialog-content');
    }
  });

  return DialogContent;
});