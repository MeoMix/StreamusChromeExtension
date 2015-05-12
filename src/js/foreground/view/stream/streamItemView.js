define(function(require) {
    'use strict';

    var ListItemView = require('foreground/view/listItemView');
    var ListItemMultiSelect = require('foreground/view/behavior/itemViewMultiSelect');
    var DeleteSongButtonView = require('foreground/view/listItemButton/deleteSongButtonView');
    var PlayPauseSongButtonView = require('foreground/view/listItemButton/playPauseSongButtonView');
    var SaveSongButtonView = require('foreground/view/listItemButton/saveSongButtonView');
    var MoreActionsButtonView = require('foreground/view/listItemButton/moreActionsButtonView');
    var StreamItemTemplate = require('text!template/stream/streamItem.html');

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

        buttonViews: [PlayPauseSongButtonView, SaveSongButtonView, DeleteSongButtonView],

        player: null,
        playPauseButton: null,

        initialize: function() {
            this.player = Streamus.backgroundPage.player;
            this.playPauseButton = Streamus.backgroundPage.playPauseButton;
        },

        onRender: function() {
            this._setActiveClass(this.model.get('active'));
        },

        onShowMoreActions: function() {
            this._showContextMenu();
        },

        showContextMenu: function() {
            Streamus.channels.contextMenu.commands.trigger('reset:items', [{
                text: chrome.i18n.getMessage('copyUrl'),
                onClick: this._copyUrl.bind(this)
            }, {
                text: chrome.i18n.getMessage('copyTitleAndUrl'),
                onClick: this._copyTitleAndUrl.bind(this)
            }, {
                text: chrome.i18n.getMessage('watchOnYouTube'),
                onClick: this._watchOnYouTube.bind(this)
            //}, {
            //    text: 'Show video',
            //    onClick: this._showVideo.bind(this)
            }]);
        },

        _onDblClick: function() {
            if (this.model.get('active')) {
                this.playPauseButton.tryTogglePlayerState();
            } else {
                this.player.set('playOnActivate', true);
                this.model.save({ active: true });
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

        _copyUrl: function() {
            this.model.get('song').copyUrl();
        },

        _copyTitleAndUrl: function() {
            this.model.get('song').copyTitleAndUrl();
        },

        _watchOnYouTube: function() {
            this.player.watchInTab(this.model.get('song'));
        },

        _showVideo: function() {
            Streamus.channels.video.commands.trigger('show:video');
        }
    });

    return StreamItemView;
});