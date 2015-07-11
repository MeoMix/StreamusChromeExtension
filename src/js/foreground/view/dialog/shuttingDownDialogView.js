define(function(require) {
  'use strict';

  var Dialog = require('foreground/model/dialog/dialog');
  var ShuttingDownView = require('foreground/view/dialog/shuttingDownView');
  var DialogView = require('foreground/view/dialog/dialogView');

  var ShuttingDownDialogView = DialogView.extend({
    id: 'shuttingDownDialog',

    initialize: function() {
      this.model = new Dialog({
        reminderProperty: 'remindShuttingDown',
        showCancelButton: false
      });

      this.contentView = new ShuttingDownView();

      DialogView.prototype.initialize.apply(this, arguments);
    }
  });

  return ShuttingDownDialogView;
});