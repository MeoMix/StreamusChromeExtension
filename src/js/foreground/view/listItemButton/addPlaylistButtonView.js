define([
    'foreground/view/listItemButton/listItemButtonView',
    'text!template/listItemButton/addListItemButton.html'
], function (ListItemButtonView, AddListItemButtonTemplate) {
    'use strict';

    var AddPlaylistButtonView = ListItemButtonView.extend({
        template: _.template(AddListItemButtonTemplate),

        initialize: function () {
            this.listenTo(this.model.get('items'), 'add remove reset', this._setDisabledState);
        },

        onRender: function () {
            this._setDisabledState();
        },
        
        _setDisabledState: function () {
            var empty = this.model.get('items').length === 0;
            this.$el.toggleClass('disabled', empty);

            var title = empty ? chrome.i18n.getMessage('playlistEmpty') : chrome.i18n.getMessage('add');
            this.$el.attr('title', title);
        },
        
        doOnClickAction: function () {
            var songs = this.model.get('items').pluck('song');
            Streamus.backgroundPage.StreamItems.addSongs(songs);
        }
    });

    return AddPlaylistButtonView;
});