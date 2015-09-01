'use strict';
import {Behavior} from 'marionette'
import Scrollable from 'foreground/view/behavior/scrollable';

var DialogContent = Behavior.extend({
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

export default DialogContent;