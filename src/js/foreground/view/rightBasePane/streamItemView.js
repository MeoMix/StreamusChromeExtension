define([
    'common/model/utility',
    'foreground/collection/contextMenuItems',
    'foreground/model/contextMenuActions',
    'foreground/view/deleteButtonView',
    'foreground/view/multiSelectListItemView',
    'foreground/view/saveToPlaylistButtonView',
    'foreground/view/playInStreamButtonView',
    'text!template/listItem.html'
], function (Utility, ContextMenuItems, ContextMenuActions, DeleteButtonView, MultiSelectListItemView, SaveToPlaylistButtonView, PlayInStreamButtonView, ListItemTemplate) {
    'use strict';

    var Playlists = Streamus.backgroundPage.Playlists;
    var Player = Streamus.backgroundPage.YouTubePlayer;
    var SignInManager = Streamus.backgroundPage.SignInManager;
    var PlayPauseButton = Streamus.backgroundPage.PlayPauseButton;

    var StreamItemView = MultiSelectListItemView.extend({
        className: MultiSelectListItemView.prototype.className + ' stream-item',
        template: _.template(ListItemTemplate),

        attributes: function () {
            return {
                'data-id': this.model.get('id'),
                'data-type': this.options.type
            };
        },
        
        events: _.extend({}, MultiSelectListItemView.prototype.events, {
            'dblclick': '_activateAndPlayOrToggleState'
        }),
        
        modelEvents: _.extend({}, MultiSelectListItemView.prototype.modelEvents, {
            'change:id': '_setDataId',
            'change:active': '_setActiveClass'
        }),
        
        buttonViews: [PlayInStreamButtonView, SaveToPlaylistButtonView, DeleteButtonView],
        
        initialize: function() {
            this.listenTo(Player, 'change:state', this._setPlayerStateClass);
            this._setPlayerStateClass();
        },

        onRender: function () {
            this._setActiveClass();
            MultiSelectListItemView.prototype.onRender.apply(this, arguments);
        },
        
        //  Keep the player state represented on the body so CSS can easily reflect the state of the Player.
        _setPlayerStateClass: function () {
            this.$el.toggleClass('playing', Player.isPlaying());
        },

        _activateAndPlayOrToggleState: function () {
            if (!this.model.get('active')) {
                Player.playOnceSongChanges();

                this.model.save({ active: true });
            } else {
                PlayPauseButton.tryTogglePlayerState();
            }
        },
        
        _setDataId: function () {
            this.$el.data('id', this.model.get('id'));
        },

        //  Force the view to reflect the model's active class. It's important to do this here, and not through render always, because
        //  render will cause the lazy-loaded image to be reset.
        _setActiveClass: function () {
            var active = this.model.get('active');
            this.$el.toggleClass('active', active);
        },

        _showContextMenu: function (event) {
            //  Whenever a context menu is shown -- set preventDefault to true to let foreground know to not reset the context menu.
            event.preventDefault();

            var activePlaylist = Playlists.getActivePlaylist();
            var alreadyExists = false;
            
            var signedIn = SignInManager.get('signedIn');
            if (signedIn) {
                alreadyExists = activePlaylist.get('items').hasSong(this.model.get('song'));
            }

            var saveTitle = '';
            if (signedIn && alreadyExists) {
                saveTitle = chrome.i18n.getMessage('duplicatesNotAllowed');
            } else if (!signedIn) {
                saveTitle = chrome.i18n.getMessage('cantSaveNotSignedIn');
            }

            ContextMenuItems.reset([{
                    text: chrome.i18n.getMessage('save'),
                    title: saveTitle,
                    disabled: !signedIn || alreadyExists,
                    onClick: this._addToActivePlaylistItems.bind(this)
                }, {
                    text: chrome.i18n.getMessage('copyUrl'),
                    onClick: this._copyUrl.bind(this)
                }, {
                    text: chrome.i18n.getMessage('copyTitleAndUrl'),
                    onClick: this._copyTitleAndUrl.bind(this)
                }, {
                    text: chrome.i18n.getMessage('delete'),
                    onClick: this._destroyModel.bind(this)
                }, {
                    text: chrome.i18n.getMessage('watchOnYouTube'),
                    onClick: this._watchOnYouTube.bind(this)
                }]
            );
        },
        
        _addToActivePlaylistItems: function () {
            var activePlaylist = Playlists.getActivePlaylist();
            activePlaylist.get('items').addSongs(this.model.get('song'));
        },
        
        _copyUrl: function () {
            var songUrl = this.model.get('song').get('url');
            ContextMenuActions.copyUrl(songUrl);
        },

        _copyTitleAndUrl: function () {
            var songTitle = this.model.get('title');
            var songUrl = this.model.get('song').get('url');
            ContextMenuActions.copyTitleAndUrl(songTitle, songUrl);
        },
        
        _destroyModel: function () {
            this.model.destroy();
        },

        _watchOnYouTube: function () {
            var song = this.model.get('song');
            ContextMenuActions.watchOnYouTube(song.get('id'), song.get('url'));
        }
    });

    return StreamItemView;
});
