define(function(require) {
    'use strict';

    var ListItemView = require('foreground/view/listItemView');
    var ListItemMultiSelect = require('foreground/view/behavior/itemViewMultiSelect');
    var AddSongButtonView = require('foreground/view/listItemButton/addSongButtonView');
    var PlayPauseSongButtonView = require('foreground/view/listItemButton/playPauseSongButtonView');
    var SaveSongButtonView = require('foreground/view/listItemButton/saveSongButtonView');
    var SearchResultTemplate = require('text!template/search/searchResult.html');
    var ContextMenuAction = require('foreground/model/contextMenuAction');

    var SearchResultView = ListItemView.extend({
        className: ListItemView.prototype.className + ' search-result listItem--medium listItem--hasButtons listItem--selectable',
        template: _.template(SearchResultTemplate),

        buttonViews: [PlayPauseSongButtonView, AddSongButtonView, SaveSongButtonView],

        events: _.extend({}, ListItemView.prototype.events, {
            'dblclick': '_onDblClick'
        }),

        behaviors: _.extend({}, ListItemView.prototype.behaviors, {
            ListItemMultiSelect: {
                behaviorClass: ListItemMultiSelect
            }
        }),

        streamItems: null,
        player: null,

        initialize: function() {
            this.streamItems = Streamus.backgroundPage.stream.get('items');
            this.player = Streamus.backgroundPage.player;
        },

        showContextMenu: function() {
            var contextMenuAction = new ContextMenuAction({
                song: this.model.get('song'),
                player: this.player
            });

            contextMenuAction.showContextMenu();
        },

        _onDblClick: function() {
            this._playInStream();
        },

        _playInStream: function() {
            this.streamItems.addSongs(this.model.get('song'), {
                playOnAdd: true
            });
        }
    });

    return SearchResultView;
});