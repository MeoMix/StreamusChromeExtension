define([
    'text!template/deletePlaylist.html'
], function (DeletePlaylistTemplate) {
    'use strict';

    var Settings = chrome.extension.getBackgroundPage().Settings;

    var DeletePlaylistView = Backbone.Marionette.ItemView.extend({
        className: 'delete-playlist',
        template: _.template(DeletePlaylistTemplate),
        
        ui: {
            reminderCheckbox: '.reminder input[type="checkbox"]'
        },
        
        templateHelpers: {
            areYouSureYouWantToDeletePlaylistMessage: chrome.i18n.getMessage('areYouSureYouWantToDeletePlaylist'),
            dontRemindMeAgainMessage: chrome.i18n.getMessage('dontRemindMeAgain')
        },
        
        _doRenderedOk: function () {
            var remindDeletePlaylist = !this.ui.reminderCheckbox.is(':checked');
            Settings.set('remindDeletePlaylist', remindDeletePlaylist);

            this.doOk();
        },
        
        doOk: function() {
            this.model.destroy();
        }
    });

    return DeletePlaylistView;
});