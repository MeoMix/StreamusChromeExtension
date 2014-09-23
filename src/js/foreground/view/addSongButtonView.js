define([
    'foreground/view/listItemButtonView',
    'text!template/addListItemButton.html'
], function (ListItemButtonView, AddListItemButtonTemplate) {
    'use strict';

    var StreamItems = Streamus.backgroundPage.StreamItems;

    var AddSongButtonView = ListItemButtonView.extend({
        template: _.template(AddListItemButtonTemplate),
        
        attributes: {
            title: chrome.i18n.getMessage('add')
        },
        
        events: {
            'click': '_onClick',
            'dblclick': '_onClick'
        },
        
        _onClick: function () {
            this._addSong();
            
            //  Don't allow event to bubble up because click event will cause it to be selected.
            return false;
        },
        
        _addSong: _.debounce(function () {
            StreamItems.addSongs(this.model.get('song'));
        }, 100, true)
    });

    return AddSongButtonView;
});