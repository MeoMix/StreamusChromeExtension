define([
    'text!template/deletePlaylist.html'
], function (DeletePlaylistTemplate) {
    'use strict';

    var Settings = Streamus.backgroundPage.Settings;

    var DeletePlaylistView = Backbone.Marionette.ItemView.extend({
        className: 'delete-playlist',
        template: _.template(DeletePlaylistTemplate),
        
        templateHelpers: {
            areYouSureYouWantToDeletePlaylistMessage: chrome.i18n.getMessage('areYouSureYouWantToDeletePlaylist')
        },
        
        doOk: function() {
            this.model.destroy();
        },
        
        _doRenderedOk: function (remindDeletePlaylist) {
            Settings.set('remindDeletePlaylist', remindDeletePlaylist);
            this.doOk();
        }
    });

    return DeletePlaylistView;
});