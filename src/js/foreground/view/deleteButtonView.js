define([
    'common/enum/listItemType',
    'foreground/view/listItemButtonView',
    'foreground/view/prompt/deletePlaylistPromptView',
    'text!template/deleteButton.html'
], function (ListItemType, ListItemButtonView, DeletePlaylistPromptView, DeleteButtonTemplate) {
    'use strict';

    var DeleteButtonView = ListItemButtonView.extend({
        template: _.template(DeleteButtonTemplate),
        
        attributes: {
            title: chrome.i18n.getMessage('delete')
        },
        
        events: {
            'click': '_doDelete',
            'dblclick': '_doDelete'
        },
        
        initialize: function () {
            this._setDisabledState();
        },
        
        _setDisabledState: function() {
            if (this.model.get('listItemType') === ListItemType.Playlist) {
                var canDelete = this.model.get('canDelete');

                var title;
                if (canDelete) {
                    title = chrome.i18n.getMessage('delete');
                } else {
                    title = chrome.i18n.getMessage('cantDeleteLastPlaylist');
                }

                this.$el.toggleClass('disabled', !canDelete).attr('title', title);
            }
        },
        
        _doDelete: _.debounce(function () {
            if (!this.$el.hasClass('disabled')) {

                if (this.model.get('listItemType') === ListItemType.Playlist) {
                    //  TODO: Logic is not DRY with ContextMenu delete operation.
                    if (this.model.get('items').length === 0) {
                        this.model.destroy();
                    } else {
                        Backbone.Wreqr.radio.channel('prompt').vent.trigger('show', DeletePlaylistPromptView, {
                            playlist: this.model
                        });
                    }
                } else {
                    this.model.destroy();
                }
            }
            
            //  Don't allow click to bubble up to the list item and cause a selection.
            return false;
        }, 100, true)
    });

    return DeleteButtonView;
});