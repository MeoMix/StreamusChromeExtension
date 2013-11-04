define([
    'text!../template/deletePlaylist.htm',
    'settings'
], function (DeletePlaylistTemplate, Settings) {
    'use strict';

    var DeletePlaylistView = Backbone.View.extend({

        className: 'deletePlaylist',

        template: _.template(DeletePlaylistTemplate),
        
        reminderCheckbox: null,
        
        render: function () {

            this.$el.html(this.template({
                'chrome.i18n': chrome.i18n,
                'title': this.model.get('title')
            }));

            this.reminderCheckbox = this.$el.find('input#remindDeletePlaylist');

            return this;
        },

        save: function() {
            var remindDeletePlaylist = !this.reminderCheckbox.is(':checked');
            Settings.set('remindDeletePlaylist', remindDeletePlaylist);

            this.model.destroy();
        }

    });

    return DeletePlaylistView;
});