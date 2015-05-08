define(function(require) {
    'use strict';

    var Dialog = require('foreground/model/dialog');
    var AboutStreamusView = require('foreground/view/dialog/aboutStreamusView');
    var DialogView = require('foreground/view/dialog/dialogView');

    var AboutStreamusDialogView = DialogView.extend({
        id: 'aboutStreamusDialog',

        initialize: function() {
            this.model = new Dialog();

            this.contentView = new AboutStreamusView({
            });

            DialogView.prototype.initialize.apply(this, arguments);
        }
    });

    return AboutStreamusDialogView;
});