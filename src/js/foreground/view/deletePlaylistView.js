define([
    'foreground/model/foregroundViewManager',
    'text!template/deletePlaylist.html',
    'foreground/model/settings'
], function (ForegroundViewManager, DeletePlaylistTemplate, Settings) {
    'use strict';

    var DeletePlaylistView = Backbone.Marionette.ItemView.extend({

        className: 'deletePlaylist',

        template: _.template(DeletePlaylistTemplate),
        
        ui: {
            reminderCheckbox: 'input#remindDeletePlaylist'
        },
        
        templateHelpers: {
            areYouSureYouWantToDeletePlaylistMessage: chrome.i18n.getMessage('areYouSureYouWantToDeletePlaylist'),
            dontRemindMeAgainMessage: chrome.i18n.getMessage('dontRemindMeAgain')
        },
        
        initialize: function () {
            ForegroundViewManager.subscribe(this);
        },
        
        doOk: function () {
            var remindDeletePlaylist = !this.ui.reminderCheckbox.is(':checked');
            Settings.set('remindDeletePlaylist', remindDeletePlaylist);

            this.model.destroy();
        }

    });

    return DeletePlaylistView;
});