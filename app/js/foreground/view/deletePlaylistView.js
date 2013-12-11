define([
    'genericForegroundView',
    'text!../template/deletePlaylist.htm',
    'settings'
], function (GenericForegroundView, DeletePlaylistTemplate, Settings) {
    'use strict';

    var DeletePlaylistView = GenericForegroundView.extend({

        className: 'deletePlaylist',

        template: _.template(DeletePlaylistTemplate),
        
        reminderCheckbox: null,
        
        render: function () {

            this.$el.html(this.template({
                'chrome.i18n': chrome.i18n,
                'title': this.model.get('title')
            }));

            return this;
        },

        doOk: function () {
            var remindDeletePlaylist = !this.$el.find('input#remindDeletePlaylist').is(':checked');

            Settings.set('remindDeletePlaylist', remindDeletePlaylist);

            this.model.destroy();
        }

    });

    return DeletePlaylistView;
});