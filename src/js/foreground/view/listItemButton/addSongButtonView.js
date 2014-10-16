define([
    'foreground/view/listItemButton/listItemButtonView',
    'text!template/listItemButton/addListItemButton.html'
], function (ListItemButtonView, AddListItemButtonTemplate) {
    'use strict';

    var AddSongButtonView = ListItemButtonView.extend({
        template: _.template(AddListItemButtonTemplate),
        
        attributes: {
            title: chrome.i18n.getMessage('add')
        },
        
        streamItems: null,
        
        initialize: function() {
            this.streamItems = Streamus.backgroundPage.StreamItems;
        },
        
        doOnClickAction: function () {
            var song = this.model.get('song');
            this.streamItems.addSongs(song);
        }
    });

    return AddSongButtonView;
});