define(function(require) {
    'use strict';

    var ListItemView = require('foreground/view/listItemView');
    var ListItemMultiSelect = require('foreground/view/behavior/itemViewMultiSelect');
    var SpinnerView = require('foreground/view/element/spinnerView');
    var AddSongButtonView = require('foreground/view/listItemButton/addSongButtonView');
    var DeleteSongButtonView = require('foreground/view/listItemButton/deleteSongButtonView');
    var PlayPauseSongButtonView = require('foreground/view/listItemButton/playPauseSongButtonView');
    var PlaylistItemTemplate = require('text!template/leftPane/playlistItem.html');
    var Tooltipable = require('foreground/view/behavior/tooltipable');
    var ContextMenuAction = require('foreground/model/contextMenuAction');

    var PlaylistItemView = ListItemView.extend({
        className: ListItemView.prototype.className + ' playlist-item listItem--medium listItem--hasButtons listItem--selectable',
        template: _.template(PlaylistItemTemplate),

        events: _.extend({}, ListItemView.prototype.events, {
            'dblclick': '_onDblClick'
        }),

        modelEvents: {
            'change:id': '_onChangeId'
        },

        behaviors: _.extend({}, ListItemView.prototype.behaviors, {
            ListItemMultiSelect: {
                behaviorClass: ListItemMultiSelect
            },
            Tooltipable: {
                behaviorClass: Tooltipable
            }
        }),

        buttonViews: [PlayPauseSongButtonView, AddSongButtonView, DeleteSongButtonView],

        streamItems: null,
        player: null,

        initialize: function() {
            this.streamItems = Streamus.backgroundPage.stream.get('items');
            this.player = Streamus.backgroundPage.player;
        },

        onRender: function() {
            this.showChildView('spinnerRegion', new SpinnerView({
                className: 'overlay u-marginAuto'
            }));

            this._setShowingSpinnerClass();
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

        _onChangeId: function(model, id) {
            this._setDataId(id);
            this._setShowingSpinnerClass();
        },
        
        //  If the playlistItem hasn't been successfully saved to the server -- show a spinner over the UI.
        _setShowingSpinnerClass: function() {
            this.$el.toggleClass('is-showingSpinner', this.model.isNew());
        },

        _setDataId: function(id) {
            //  I'm not 100% positive I need to set both here, but .data() is cached in jQuery and .attr() is on the view, so seems good to keep both up to date.
            this.$el.data('id', id).attr('id', id);
        },

        _playInStream: function() {
            this.streamItems.addSongs(this.model.get('song'), {
                playOnAdd: true
            });
        }
    });

    return PlaylistItemView;
});