define([
    'foreground/model/playlistAction',
    'foreground/view/listItemButton/listItemButtonView',
    'foreground/view/dialog/deletePlaylistDialogView',
    'text!template/listItemButton/deleteListItemButton.html'
], function (PlaylistAction, ListItemButtonView, DeletePlaylistDialogView, DeleteListItemButtonTemplate) {
    'use strict';

    var DeletePlaylistButtonView = ListItemButtonView.extend({
        template: _.template(DeleteListItemButtonTemplate),
        
        attributes: {
            title: chrome.i18n.getMessage('delete')
        },

        initialize: function () {
            this._setState();
            
            ListItemButtonView.prototype.initialize.apply(this, arguments);
        },
        
        doOnClickAction: function () {
            var playlistAction = new PlaylistAction({
                playlist: this.model
            });

            playlistAction.deletePlaylist();
        },
        
        _setState: function () {
            var canDelete = this.model.get('canDelete');

            var title;
            if (canDelete) {
                title = chrome.i18n.getMessage('delete');
            } else {
                title = chrome.i18n.getMessage('cantDeleteLastPlaylist');
            }

            this.$el.toggleClass('disabled', !canDelete).attr('title', title);
        }
    });

    return DeletePlaylistButtonView;
});