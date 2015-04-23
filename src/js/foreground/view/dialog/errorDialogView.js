define(function(require) {
    'use strict';

    var Dialog = require('foreground/model/dialog');
    var DialogContentView = require('foreground/view/dialog/dialogContentView');
    var DialogView = require('foreground/view/dialog/dialogView');

    var ErrorDialogView = DialogView.extend({
        id: 'errorDialog',
        player: null,
   
        initialize: function(options) {
            this.player = Streamus.backgroundPage.player;

            this.model = new Dialog({
                showCancelButton: false
            });

            this.contentView = new DialogContentView({
                template: _.template(options.text)
            });

            DialogView.prototype.initialize.apply(this, arguments);

            var loadedSong = this.player.get('loadedSong');
            var loadedSongId = loadedSong ? loadedSong.get('id') : '';
            var error = new Error('Error: ' + options.error + ', loadedSongId:' + loadedSongId);
            Streamus.backgroundChannels.error.commands.trigger('log:error', error);
        }
    });

    return ErrorDialogView;
});