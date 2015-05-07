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

            //  TODO: This tends to flood my DB with errors. Possible (expected) errors still need to be handled:
            //  - Geographic restrictions aren't filtered from results and then fail to play properly.
            //  - Songs which have been removed from YouTube for copyright issues are very common.
            //var loadedSong = this.player.get('loadedSong');
            //var loadedSongId = loadedSong ? loadedSong.get('id') : '';
            //var error = new Error('Error: ' + options.error + ', loadedSongId:' + loadedSongId);
            //Streamus.backgroundChannels.error.commands.trigger('log:error', error);
        }
    });

    return ErrorDialogView;
});