'use strict';

import Dialog from 'foreground/model/dialog/dialog';
import ErrorView from 'foreground/view/dialog/errorView';
import DialogView from 'foreground/view/dialog/dialogView';

var ErrorDialogView = DialogView.extend({
  id: 'errorDialog',
  player: null,

  initialize: function(options) {
    this.player = options.player;

    this.model = new Dialog({
      showCancelButton: false
    });

    this.contentView = new ErrorView({
      text: options.text
    });

    DialogView.prototype.initialize.apply(this, arguments);
  }
});

export default ErrorDialogView;