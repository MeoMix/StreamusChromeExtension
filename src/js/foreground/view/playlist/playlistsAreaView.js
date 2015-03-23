define(function(require) {
    'use strict';

    var PlaylistsView = require('foreground/view/playlist/playlistsView');
    var CreatePlaylistDialogView = require('foreground/view/dialog/createPlaylistDialogView');
    var PlaylistsAreaTemplate = require('text!template/playlist/playlistsArea.html');

    var PlaylistsAreaView = Marionette.LayoutView.extend({
        id: 'playlistsArea',
        className: 'flexColumn',
        template: _.template(PlaylistsAreaTemplate),
        templateHelpers: function() {
            return {
                viewId: this.id,
                createPlaylist: chrome.i18n.getMessage('createPlaylist')
            };
        },

        regions: function() {
            return {
                playlistsRegion: '#' + this.id + '-playlistsRegion'
            };
        },

        ui: function() {
            return {
                transitionable: '.u-transitionable',
                overlay: '#' + this.id + '-overlay',
                panel: '#' + this.id + '-panel',
                createPlaylistButton: '#' + this.id + '-createPlaylistButton'
            };
        },

        events: {
            'click @ui.overlay': '_onClickOverlay',
            'click @ui.hideButton': '_onClickHideButton',
            'click @ui.createPlaylistButton': '_onClickCreatePlaylistButton'
        },

        playlists: null,

        //  TODO: This feels weird...
        initialize: function(options) {
            this.playlists = options.playlists;
        },

        onRender: function() {
            var playlistsView = new PlaylistsView({
                collection: this.playlists
            });

            this.playlistsRegion.show(playlistsView);
            // TODO: This also feels kind of weird.
            this.listenTo(playlistsView, 'click:childContainer', this._onClickChildContainer);
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
 
        //  Whenever a playlist is clicked it will become active and the menu should hide itself.
        _onClickChildContainer: function() {
            this.hide();
        }
    });

    return PlaylistsAreaView;
});