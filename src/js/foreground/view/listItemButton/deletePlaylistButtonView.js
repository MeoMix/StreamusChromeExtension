define([
    'foreground/view/listItemButton/listItemButtonView',
    'foreground/view/prompt/deletePlaylistPromptView',
    'text!template/listItemButton/deleteListItemButton.html'
], function (ListItemButtonView, DeletePlaylistPromptView, DeleteListItemButtonTemplate) {
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
            //  TODO: Logic is not DRY with ContextMenu delete operation.
            if (this.model.get('items').length === 0) {
                this.model.destroy();
            } else {
                Backbone.Wreqr.radio.channel('prompt').vent.trigger('show', DeletePlaylistPromptView, {
                    playlist: this.model
                });
            }
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