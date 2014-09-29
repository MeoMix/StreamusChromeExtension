define([
    'foreground/model/playlistAction',
    'foreground/view/listItemButton/listItemButtonView',
    'foreground/view/prompt/deletePlaylistPromptView',
    'text!template/listItemButton/deleteListItemButton.html'
], function (PlaylistAction, ListItemButtonView, DeletePlaylistPromptView, DeleteListItemButtonTemplate) {
    'use strict';

    var DeletePlaylistButtonView = ListItemButtonView.extend({
        template: _.template(DeleteListItemButtonTemplate),
        
        attributes: {
            title: chrome.i18n.getMessage('delete')
        },

        initialize: function () {
            this._setDisabledState();
        },
        
        doOnClickAction: function () {
            PlaylistAction.deletePlaylist(this.model);
        },
        
        _setDisabledState: function() {
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