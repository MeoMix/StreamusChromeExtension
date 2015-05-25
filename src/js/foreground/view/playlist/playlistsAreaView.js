define(function(require) {
    'use strict';

    var PlaylistsView = require('foreground/view/playlist/playlistsView');
    var CreatePlaylistDialogView = require('foreground/view/dialog/createPlaylistDialogView');
    var PlaylistsAreaTemplate = require('text!template/playlist/playlistsArea.html');

    var PlaylistsAreaView = Marionette.LayoutView.extend({
        id: 'playlistsArea',
        className: 'flexColumn',
        template: _.template(PlaylistsAreaTemplate),
        templateHelpers: {
            createPlaylist: chrome.i18n.getMessage('createPlaylist')
        },

        regions: {
            playlists: '[data-region=playlists]'
        },

        ui: {
            transitionable: '[data-ui~=transitionable]',
            overlay: '[data-ui~=overlay]',
            panel: '[data-ui~=panel]',
            createPlaylistButton: '[data-ui~=createPlaylistButton]'
        },

        events: {
            'click @ui.overlay': '_onClickOverlay',
            'click @ui.hideButton': '_onClickHideButton',
            'click @ui.createPlaylistButton': '_onClickCreatePlaylistButton'
        },

        childEvents: {
            'click:listItems': '_onClickListItems'
        },

        playlists: null,

        initialize: function(options) {
            this.playlists = options.playlists;
        },

        onRender: function() {
            this.showChildView('playlists', new PlaylistsView({
                collection: this.playlists
            }));
        },

        show: function() {
            Streamus.channels.playlistsArea.vent.trigger('showing');
            this.ui.transitionable.addClass('is-visible');
        },

        hide: function() {
            Streamus.channels.playlistsArea.vent.trigger('hiding');
            this.ui.transitionable.removeClass('is-visible');
        },

        _onClickHideButton: function() {
            this.hide();
        },

        _onClickOverlay: function() {
            this.hide();
        },

        _onClickCreatePlaylistButton: function() {
            Streamus.channels.dialog.commands.trigger('show:dialog', CreatePlaylistDialogView);
        },

        // Whenever a playlist is clicked it will become active and the menu should hide itself.
        _onClickListItems: function() {
            this.hide();
        }
    });

    return PlaylistsAreaView;
});