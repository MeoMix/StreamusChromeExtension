define(function(require) {
    'use strict';

    var ListItemView = require('foreground/view/listItemView');
    var ListItemMultiSelect = require('foreground/view/behavior/itemViewMultiSelect');
    var DeleteListItemButtonView = require('foreground/view/listItemButton/deleteListItemButtonView');
    var PlayPauseSongButtonView = require('foreground/view/listItemButton/playPauseSongButtonView');
    var SaveSongButtonView = require('foreground/view/listItemButton/saveSongButtonView');
    var MoreActionsButtonView = require('foreground/view/listItemButton/moreActionsButtonView');
    var StreamItemTemplate = require('text!template/stream/streamItem.html');
    var ContextMenuAction = require('foreground/model/contextMenu/contextMenuAction');

    var StreamItemView = ListItemView.extend({
        className: ListItemView.prototype.className + ' stream-item listItem--medium listItem--hasButtons listItem--selectable',
        template: _.template(StreamItemTemplate),

        events: _.extend({}, ListItemView.prototype.events, {
            'dblclick': '_onDblClick',
            //  TODO: bad
            'click .moreActions': '_showContextMenu'
        }),

        modelEvents: {
            'change:id': '_onChangeId',
            'change:active': '_onChangeActive'
        },

        behaviors: _.extend({}, ListItemView.prototype.behaviors, {
            ListItemMultiSelect: {
                behaviorClass: ListItemMultiSelect
            }
        }),

        buttonViewOptions: function() {
            return {
                PlayPauseSongButtonView: {
                    viewClass: PlayPauseSongButtonView,
                    model: this.model.get('song'),
                    streamItems: Streamus.backgroundPage.stream.get('items'),
                    player: Streamus.backgroundPage.player
                },
                SaveSongButtonView: {
                    viewClass: SaveSongButtonView,
                    model: this.model.get('song'),
                    signInManager: Streamus.backgroundPage.signInManager
                },
                DeleteListItemButtonView: {
                    viewClass: DeleteListItemButtonView,
                    model: this.model
                }
            };
        },

        player: null,
        playPauseButton: null,

        initialize: function(options) {
            this.player = options.player;
            this.playPauseButton = options.playPauseButton;
        },

        onRender: function() {
            this._setActiveClass(this.model.get('active'));
        },

        onShowMoreActions: function() {
            this._showContextMenu();
        },

        showContextMenu: function() {
            var contextMenuAction = new ContextMenuAction({
                song: this.model.get('song'),
                player: this.player
            });

            contextMenuAction.showContextMenu();
        },

        _onDblClick: function() {
            if (this.model.get('active')) {
                this.playPauseButton.tryTogglePlayerState();
            } else {
                this.player.set('playOnActivate', true);
                this.model.save({active: true});
            }
        },

        _onChangeId: function(model, id) {
            //  I'm not 100% positive I need to set both here, but .data() is cached in jQuery and .attr() is on the view, so seems good to keep both up to date.
            this.$el.data('id', id).attr('id', id);
        },

        _onChangeActive: function(model, active) {
            this._setActiveClass(active);
        },

        //  Force the view to reflect the model's active class. It's important to do this here, and not through render always, because
        //  render will cause the lazy-loaded image to be reset.
        _setActiveClass: function(active) {
            this.$el.toggleClass('is-active', active);
        },

        _showVideo: function() {
            Streamus.channels.video.commands.trigger('show:video');
        }
    });

    return StreamItemView;
});