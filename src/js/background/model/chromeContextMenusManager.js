//  A model which interfaces with the chrome.contextMenus API to generate context menus when clicking on YouTube pages or links.
define([
    'background/model/dataSource',
    'background/model/song',
    'background/model/youTubeV3API'
], function (DataSource, Song, YouTubeV3API) {
    'use strict';

    var ChromeContextMenusManager = Backbone.Model.extend({
        defaults: {
            textSelectionId: -1,
            youTubeLinkPlayId: -1,
            youTubeLinkAddId: -1,
            youTubeLinkSaveId: -1,
            youTubePagePlayId: -1,
            youTubePageAddId: -1,
            youTubePageSaveId: -1,
            streamItems: null,
            browserSettings: null,
            tabManager: null,
            signInManager: null,
            playlists: null,
        },

        initialize: function () {
            this._setTextSelection();
            this._setYouTubeLinks();
            this._setYouTubePages();
            
            this.listenTo(this.get('browserSettings'), 'change:showContextMenuOnTextSelection', this._setTextSelection);
            this.listenTo(this.get('browserSettings'), 'change:showContextMenuOnYouTubeLinks', this._setYouTubeLinks);
            this.listenTo(this.get('browserSettings'), 'change:showContextMenuOnYouTubePages', this._setYouTubePages);
            this.listenTo(this.get('signInManager'), 'change:signedInUser', this._onChangeSignedInUser);
            this.listenTo(this.get('playlists'), 'add', this._onPlaylistAdded);
        },
        
        _onPlaylistAdded: function (addedPlaylist) {
            if (this.get('browserSettings').get('showContextMenuOnYouTubeLinks')) {
                this._createPlaylistContextMenu(this._getContextMenuOptions(true), this.get('youTubeLinkSaveId'), addedPlaylist);
            }

            if (this.get('browserSettings').get('showContextMenuOnYouTubePages')) {
                this._createPlaylistContextMenu(this._getContextMenuOptions(false), this.get('youTubePageSaveId'), addedPlaylist);
            }
        },
        
        _onChangeSignedInUser: function (model, signedInUser) {
            if (signedInUser !== null) {
                if (this.get('browserSettings').get('showContextMenuOnYouTubeLinks')) {
                    this.set('youTubeLinkSaveId', this._createSaveContextMenu(this._getContextMenuOptions(true)));
                }
                
                if (this.get('browserSettings').get('showContextMenuOnYouTubePages')) {
                    this.set('youTubePageSaveId', this._createSaveContextMenu(this._getContextMenuOptions(false)));
                }
            } else {
                this._removeContextMenu('youTubeLinkSaveId');
                this._removeContextMenu('youTubePageSaveId');
            }
        },
        
        _setTextSelection: function () {
            this.get('browserSettings').get('showContextMenuOnTextSelection') ? this._createTextSelection() : this._removeContextMenu('textSelectionId');
        },
        
        _setYouTubeLinks: function () {
            this.get('browserSettings').get('showContextMenuOnYouTubeLinks') ? this._createYouTubeLinks() : this._removeYouTubeLinks();
        },
        
        _setYouTubePages: function () {
            this.get('browserSettings').get('showContextMenuOnYouTubePages') ? this._createYouTubePages() : this._removeYouTubePages();
        },
        
        _createYouTubeLinks: function() {
            var contextMenuOptions = this._getContextMenuOptions(true);

            this.set('youTubeLinkPlayId', this._createPlayContextMenu(contextMenuOptions));
            this.set('youTubeLinkAddId', this._createAddContextMenu(contextMenuOptions));

            if (this.get('signInManager').get('signedInUser') !== null) {
                this.set('youTubeLinkSaveId', this._createSaveContextMenu(contextMenuOptions));
            }
        },

        _createYouTubePages: function () {
            var contextMenuOptions = this._getContextMenuOptions(false);

            this.set('youTubePagePlayId', this._createPlayContextMenu(contextMenuOptions));
            this.set('youTubePageAddId', this._createAddContextMenu(contextMenuOptions));

            if (this.get('signInManager').get('signedInUser') !== null) {
                this.set('youTubePageSaveId', this._createSaveContextMenu(contextMenuOptions));
            }
        },

        _createTextSelection: function () {
            var textSelectionId = chrome.contextMenus.create({
                'contexts': ['selection'],
                'title': chrome.i18n.getMessage('searchForAndPlay') + ' \'%s\'',
                'onclick': this._onClickTextSelectionContextMenu.bind(this)
            });

            this.set('textSelectionId', textSelectionId);
        },
        
        _removeYouTubeLinks: function() {
            this._removeContextMenu('youTubeLinkPlayId');
            this._removeContextMenu('youTubeLinkAddId');
            this._removeContextMenu('youTubeLinkSaveId');
        },
        
        _removeYouTubePages: function () {
            this._removeContextMenu('youTubePagePlayId');
            this._removeContextMenu('youTubePageAddId');
            this._removeContextMenu('youTubePageSaveId');
        },
        
        _removeContextMenu: function (contextMenuIdPropertyName) {
            var contextMenuId = this.get(contextMenuIdPropertyName);

            if (contextMenuId !== -1) {
                chrome.contextMenus.remove(contextMenuId);
                this.set(contextMenuIdPropertyName, -1);
            }
        },
        
        _createPlayContextMenu: function(contextMenuOptions) {
            var playId = chrome.contextMenus.create(_.extend({}, contextMenuOptions, {
                'title': chrome.i18n.getMessage('play'),
                'onclick': this._onClickPlayContextMenu.bind(this)
            }));

            return playId;
        },
        
        _createAddContextMenu: function(contextMenuOptions) {
            var addId = chrome.contextMenus.create(_.extend({}, contextMenuOptions, {
                'title': chrome.i18n.getMessage('add'),
                'onclick': this._onClickAddContextMenu.bind(this)
            }));

            return addId;
        },
        
        _createSaveContextMenu: function(contextMenuOptions) {
            //  Create a sub menu item to hold playlists
            var saveContextMenuId = chrome.contextMenus.create(_.extend({}, contextMenuOptions, {
                'title': chrome.i18n.getMessage('save')
            }));

            //  Create menu items for each playlist
            this.get('playlists').each(function (playlist) {
                this._createPlaylistContextMenu(contextMenuOptions, saveContextMenuId, playlist);
            }.bind(this));

            return saveContextMenuId;
        },
        
        //  Whenever a playlist context menu is clicked -- add the related song to that playlist.
        _createPlaylistContextMenu: function (contextMenuOptions, parentId, playlist) {
            var playlistContextMenuId = chrome.contextMenus.create(_.extend({}, contextMenuOptions, {
                'title': playlist.get('title'),
                'parentId': parentId,
                'onclick': this._onClickSaveContextMenu.bind(this, playlist)
            }));

            //  Update context menu items whenever the playlist's data changes (renamed or deleted)
            this.listenTo(playlist, 'change:title', function () {
                chrome.contextMenus.update(playlistContextMenuId, {
                    'title': playlist.get('title')
                });
            });

            this.listenTo(playlist, 'destroy', function () {
                chrome.contextMenus.remove(playlistContextMenuId);
            });
        },
        
        _getSongFromText: function (text, callback) {
            YouTubeV3API.getSongInformationByTitle({
                title: text,
                success: function(songInformation) {
                    callback(new Song(songInformation));
                }
            });
        },
        
        //  TODO: This should be kept DRY outside of ContextMenu logic.
        _getSongFromUrl: function(url, callback) {
            var dataSource = new DataSource({ url: url });

            dataSource.parseUrl({
                success: function() {
                    YouTubeV3API.getSongInformation({
                        songId: dataSource.get('id'),
                        success: function (songInformation) {
                            callback(new Song(songInformation));
                        },
                        error: function () {
                            Streamus.channels.backgroundNotification.commands.trigger('show:notification', {
                                title: chrome.i18n.getMessage('failedToFindSong'),
                                message: chrome.i18n.getMessage('anIssueWasEncounteredWhileAttemptingToFindSongWithUrl') + ' ' + url
                            });
                        }
                    });
                }
            });
        },
        
        _getContextMenuOptions: function (isLink) {
            var urlPatterns = this.get('tabManager').get('youTubeUrlPatterns');

            var contextMenuOptions = {
                contexts: isLink ? ['link'] : ['page'],
                targetUrlPatterns: isLink ? urlPatterns : undefined,
                documentUrlPatterns: !isLink ? urlPatterns : undefined
            };

            return contextMenuOptions;
        },
        
        _onClickTextSelectionContextMenu: function (onClickData) {
            this._getSongFromText(onClickData.selectionText, function (song) {
                this.get('streamItems').addSongs(song, {
                    playOnAdd: true
                });
            }.bind(this));
        },
        
        _onClickPlayContextMenu: function(onClickData) {
            var url = onClickData.linkUrl || onClickData.pageUrl;

            this._getSongFromUrl(url, function (song) {
                this.get('streamItems').addSongs(song, {
                    playOnAdd: true
                });
            }.bind(this));
        },
        
        _onClickAddContextMenu: function(onClickData) {
            var url = onClickData.linkUrl || onClickData.pageUrl;

            this._getSongFromUrl(url, function (song) {
                this.get('streamItems').addSongs(song);
            }.bind(this));
        },
        
        _onClickSaveContextMenu: function(playlist, onClickData) {
            var url = onClickData.linkUrl || onClickData.pageUrl;

            this._getSongFromUrl(url, function (song) {
                playlist.get('items').addSongs(song);
            });
        }
    });

    return ChromeContextMenusManager;
});