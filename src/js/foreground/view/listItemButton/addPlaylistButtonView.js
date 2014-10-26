define([
    'foreground/view/listItemButton/listItemButtonView',
    'text!template/listItemButton/addListItemButton.html'
], function (ListItemButtonView, AddListItemButtonTemplate) {
    'use strict';

    var AddPlaylistButtonView = ListItemButtonView.extend({
        template: _.template(AddListItemButtonTemplate),
        
        streamItems: null,

        initialize: function () {
            this.streamItems = Streamus.backgroundPage.StreamItems;
            this.listenTo(this.model.get('items'), 'add remove reset', this._setDisabledState);
            this.listenTo(this.streamItems, 'add remove reset', this._setDisabledState);

            ListItemButtonView.prototype.initialize.apply(this, arguments);
        },

        onRender: function () {
            this._setDisabledState();
        },
        
        _setDisabledState: function () {
            var playlistItems = this.model.get('items');
            var empty = playlistItems.length === 0;
            var duplicatesInfo = this.streamItems.getDuplicatesInfo(playlistItems.pluck('song'));

            this.$el.toggleClass('disabled', empty || duplicatesInfo.allDuplicates);

            var title = chrome.i18n.getMessage('add');
            
            if (empty) {
                title = chrome.i18n.getMessage('playlistEmpty');
            }
            else if (duplicatesInfo.message !== '') {
                title = duplicatesInfo.message;
            }

            this.$el.attr('title', title);
        },
        
        doOnClickAction: function () {
            var songs = this.model.get('items').pluck('song');
            this.streamItems.addSongs(songs);
        }
    });

    return AddPlaylistButtonView;
});