define([
    'foreground/view/listItemView',
    'foreground/view/behavior/itemViewMultiSelect',
    'foreground/view/listItemButton/addSongButtonView',
    'foreground/view/listItemButton/playSongButtonView',
    'foreground/view/listItemButton/saveSongButtonView',
    'text!template/search/searchResult.html'
], function (ListItemView, ItemViewMultiSelect, AddSongButtonView, PlaySongButtonView, SaveSongButtonView, SearchResultTemplate) {
    'use strict';
    
    var SearchResultView = ListItemView.extend({
        className: ListItemView.prototype.className + ' search-result listItem--medium',
        template: _.template(SearchResultTemplate),

        buttonViews: [PlaySongButtonView, AddSongButtonView, SaveSongButtonView],
        
        events: _.extend({}, ListItemView.prototype.events, {
            'dblclick': '_onDblClick'
        }),
        
        behaviors: _.extend({}, ListItemView.prototype.behaviors, {
            ItemViewMultiSelect: {
                behaviorClass: ItemViewMultiSelect
            }
        }),
        
        streamItems: null,
        player: null,
        
        initialize: function () {
            this.streamItems = Streamus.backgroundPage.stream.get('items');
            this.player = Streamus.backgroundPage.player;
        },
        
        showContextMenu: function () {
            Streamus.channels.contextMenu.commands.trigger('reset:items', [{
                text: chrome.i18n.getMessage('copyUrl'),
                onClick: this._copyUrl.bind(this)
            }, {
                text: chrome.i18n.getMessage('copyTitleAndUrl'),
                onClick: this._copyTitleAndUrl.bind(this)
            }, {
                text: chrome.i18n.getMessage('watchOnYouTube'),
                onClick: this._watchOnYouTube.bind(this)
            }]);
        },
        
        _onDblClick: function () {
            this._playInStream();
        },

        _playInStream: function () {
            this.streamItems.addSongs(this.model.get('song'), {
                playOnAdd: true
            });
        },
        
        _copyUrl: function () {
            this.model.get('song').copyUrl();
        },

        _copyTitleAndUrl: function () {
            this.model.get('song').copyTitleAndUrl();
        },

        _watchOnYouTube: function () {
            this.player.watchInTab(this.model.get('song'));
        }
    });

    return SearchResultView;
});