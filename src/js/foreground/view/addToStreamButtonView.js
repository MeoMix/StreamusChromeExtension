define([
    'common/enum/listItemType',
    'foreground/view/listItemButtonView',
    'text!template/addToStreamButton.html'
], function (ListItemType, ListItemButtonView, AddToStreamButtonTemplate) {
    'use strict';

    var StreamItems = Streamus.backgroundPage.StreamItems;

    var AddToStreamButtonView = ListItemButtonView.extend({
        template: _.template(AddToStreamButtonTemplate),
        
        attributes: {
            title: chrome.i18n.getMessage('add')
        },
        
        events: {
            'click': '_addToStream',
            'dblclick': '_addToStream'
        },
        
        _addToStream: _.debounce(function () {
            StreamItems.addSongs(this._getSongs());

            //  Don't allow dblclick to bubble up to the list item and cause a play.
            return false;
        }, 100, true),
        
        _getSongs: function () {
            var songs = [];
            var listItemType = this.model.get('listItemType');
            
            switch(listItemType) {
                case ListItemType.Playlist:
                    songs = this.model.get('items').pluck('song');
                    break;
                case ListItemType.PlaylistItem:
                case ListItemType.SearchResult:
                case ListItemType.StreamItem:
                    songs.push(this.model.get('song'));
                    break;
                default:
                    throw new Error("Unhandled listItemType: " + listItemType);
            }

            return songs;
        }
    });

    return AddToStreamButtonView;
});