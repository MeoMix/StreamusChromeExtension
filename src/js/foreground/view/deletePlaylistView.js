define([
    'background/model/settings',
    'text!template/deletePlaylist.html'
], function (Settings, DeletePlaylistTemplate) {
    'use strict';

    var DeletePlaylistView = Backbone.Marionette.ItemView.extend({

        className: 'delete-playlist',

        template: _.template(DeletePlaylistTemplate),
        
        ui: {
            reminderCheckbox: '#remind-delete-playlist'
        },
        
        templateHelpers: {
            areYouSureYouWantToDeletePlaylistMessage: chrome.i18n.getMessage('areYouSureYouWantToDeletePlaylist'),
            dontRemindMeAgainMessage: chrome.i18n.getMessage('dontRemindMeAgain')
        },
        
        doOk: function () {
            var remindDeletePlaylist = !this.ui.reminderCheckbox.is(':checked');
            Settings.set('remindDeletePlaylist', remindDeletePlaylist);

            this.model.destroy();
        }

    });

    return DeletePlaylistView;
});