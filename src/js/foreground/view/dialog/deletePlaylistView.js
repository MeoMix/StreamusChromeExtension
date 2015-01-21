define(function (require) {
    'use strict';

    var DialogContentView = require('foreground/view/dialog/dialogContentView');
    var DeletePlaylistTemplate = require('text!template/dialog/deletePlaylist.html');

    var DeletePlaylistView = DialogContentView.extend({
        template: _.template(DeletePlaylistTemplate),
        
        templateHelpers: {
            deleteMessage: chrome.i18n.getMessage('delete')
        },
        
        deletePlaylist: function() {
            this.model.destroy();
        }
    });

    return DeletePlaylistView;
});