define(function(require) {
    'use strict';

    var Dialog = require('foreground/model/dialog/dialog');
    var ErrorView = require('foreground/view/dialog/errorView');
    var DialogView = require('foreground/view/dialog/dialogView');

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

    return ErrorDialogView;
});