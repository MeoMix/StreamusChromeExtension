//  TODO: This is too specific of a usecase, I'd like to expand upon it in the future and make it generic, maybe combine it with ContextMenu if possible.
define(function(require) {
    'use strict';

    var SimpleMenuItems = require('foreground/collection/element/simpleMenuItems');
    var FixedMenuItem = require('foreground/model/element/fixedMenuItem');
    var SimpleMenu = require('foreground/model/element/simpleMenu');
    var SimpleMenuView = require('foreground/view/element/simpleMenuView');
    var CreatePlaylistDialogView = require('foreground/view/dialog/createPlaylistDialogView');

    var SaveSongsRegion = Marionette.Region.extend({
        signInManager: null,

        initialize: function(options) {
            this.signInManager = options.signInManager;
            this.listenTo(Streamus.channels.saveSongs.commands, 'show:simpleMenu', this._showSimpleMenu);
        },

        _showSimpleMenu: function(options) {
            //  Wrap the logic for showing a simpleMenu in defer to allow 'click' event to fully propagate before showing the view.
            //  This ensure that a click event which spawned the simpleMenu does not also trigger the closing of the menu
            _.defer(function() {
                var playlists = this.signInManager.get('signedInUser').get('playlists');

                var simpleMenuItems = new SimpleMenuItems(playlists.map(function(playlist) {
                    return {
                        active: playlist.get('active'),
                        text: playlist.get('title'),
                        value: playlist.get('id')
                    };
                }));

                var simpleMenuView = new SimpleMenuView({
                    model: new SimpleMenu({
                        reposition: true,
                        repositionData: {
                            top: options.top,
                            left: options.left,
                            containerHeight: this.$el.height(),
                            containerWidth: this.$el.width(),
                        },
                        simpleMenuItems: simpleMenuItems,
                        fixedMenuItem: new FixedMenuItem({
                            text: chrome.i18n.getMessage('createPlaylist')
                        })
                    })
                });

                simpleMenuView.on('click:simpleMenuItem', this._onClickSimpleMenuItem.bind(this, playlists, options.songs));
                simpleMenuView.on('click:fixedMenuItem', this._onClickFixedMenuItem.bind(this, options.songs));

                this.show(simpleMenuView);
            }.bind(this));
        },

        _onClickSimpleMenuItem: function(playlists, songs, eventArgs) {
            var activeItem = eventArgs.model.get('simpleMenuItems').getActive();
            var playlist = playlists.get(activeItem.get('value'));
            playlist.get('items').addSongs(songs);
        },

        _onClickFixedMenuItem: function(songs) {
            Streamus.channels.dialog.commands.trigger('show:dialog', CreatePlaylistDialogView, {
                songs: songs
            });
        }
    });

    return SaveSongsRegion;
});