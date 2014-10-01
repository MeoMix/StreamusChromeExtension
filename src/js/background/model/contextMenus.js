//  A model which interfaces with the chrome.contextMenus API to generate context menus when clicking on YouTube pages or links.
define([
    'background/collection/streamItems',
    'background/collection/playlists',
    'background/model/browserSettings',
    'background/model/chromeNotifications',
    'background/model/signInManager',
    'background/model/song',
    'background/model/tabManager',
    'common/enum/dataSourceType',
    'common/model/youTubeV3API',
    'common/model/utility',
    'common/model/dataSource'
], function (StreamItems, Playlists, BrowserSettings, ChromeNotifications, SignInManager, Song, TabManager, DataSourceType, YouTubeV3API, Utility, DataSource) {
    'use strict';

    var ContextMenu = Backbone.Model.extend({
        defaults: {
            textSelectionId: -1,
            youTubeLinkPlayId: -1,
            youTubeLinkAddId: -1,
            youTubeLinkSaveId: -1,
            youTubePagePlayId: -1,
            youTubePageAddId: -1,
            youTubePageSaveId: -1
        },

        initialize: function () {
            this._setTextSelection();
            this._setYouTubeLinks();
            this._setYouTubePages();
            
            this.listenTo(BrowserSettings, 'change:showContextMenuOnTextSelection', this._setTextSelection);
            this.listenTo(BrowserSettings, 'change:showContextMenuOnYouTubeLinks', this._setYouTubeLinks);
            this.listenTo(BrowserSettings, 'change:showContextMenuOnYouTubePages', this._setYouTubePages);
            this.listenTo(SignInManager, 'change:signedIn', this._onChangeSignedIn);
            this.listenTo(Playlists, 'add', this._onPlaylistAdded);
        },
        
        _onPlaylistAdded: function (addedPlaylist) {
            if (BrowserSettings.get('showContextMenuOnYouTubeLinks')) {
                this._createPlaylistContextMenu(this._getContextMenuOptions(true), this.get('youTubeLinkSaveId'), addedPlaylist);
            }

            if (BrowserSettings.get('showContextMenuOnYouTubePages')) {
                this._createPlaylistContextMenu(this._getContextMenuOptions(false), this.get('youTubePageSaveId'), addedPlaylist);
            }
        },
        
        _onChangeSignedIn: function(model, signedIn) {
            if (signedIn) {
                if (BrowserSettings.get('showContextMenuOnYouTubeLinks')) {
                    this.set('youTubeLinkSaveId', this._createSaveContextMenu(this._getContextMenuOptions(true)));
                }
                
                if (BrowserSettings.get('showContextMenuOnYouTubePages')) {
                    this.set('youTubePageSaveId', this._createSaveContextMenu(this._getContextMenuOptions(false)));
                }
            } else {
                this._removeContextMenu('youTubeLinkSaveId');
                this._removeContextMenu('youTubePageSaveId');
            }
        },
        
        _setTextSelection: function () {
            BrowserSettings.get('showContextMenuOnTextSelection') ? this._createTextSelection() : this._removeContextMenu('textSelectionId');
        },
        
        _setYouTubeLinks: function () {
            BrowserSettings.get('showContextMenuOnYouTubeLinks') ? this._createYouTubeLinks() : this._removeYouTubeLinks();
        },
        
        _setYouTubePages: function () {
            BrowserSettings.get('showContextMenuOnYouTubePages') ? this._createYouTubePages() : this._removeYouTubePages();
        },
        
        _createYouTubeLinks: function() {
            var contextMenuOptions = this._getContextMenuOptions(true);

            this.set('youTubeLinkPlayId', this._createPlayContextMenu(contextMenuOptions));
            this.set('youTubeLinkAddId', this._createAddContextMenu(contextMenuOptions));

            if (SignInManager.get('signedIn')) {
                this.set('youTubeLinkSaveId', this._createSaveContextMenu(contextMenuOptions));
            }
        },

        _createYouTubePages: function () {
            var contextMenuOptions = this._getContextMenuOptions(false);

            this.set('youTubePagePlayId', this._createPlayContextMenu(contextMenuOptions));
            this.set('youTubePageAddId', this._createAddContextMenu(contextMenuOptions));

            if (SignInManager.get('signedIn')) {
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
            //  Create a sub menu item to hold all Playlists
            var saveContextMenuId = chrome.contextMenus.create(_.extend({}, contextMenuOptions, {
                'title': chrome.i18n.getMessage('save')
            }));

            //  Create menu items for each playlist
            Playlists.each(function (playlist) {
                this._createPlaylistContextMenu(contextMenuOptions, saveContextMenuId, playlist);
            }.bind(this));

            return saveContextMenuId;
        },
        
        //  Whenever a playlist context menu is clicked -- add the related song to that playlist.
        _createPlaylistContextMenu: function (contextMenuOptions, parentId, playlist) {
            var playlistContextMenuId = chrome.contextMenus.create(_.extend({}, contextMenuOptions, {
                'title': playlist.get('title'),
                'parentId': parentId,
                'onclick': this._onClickSaveContextMenu.bind(this)
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
                            ChromeNotifications.create({
                                title: chrome.i18n.getMessage('failedToFindSong'),
                                message: chrome.i18n.getMessage('anIssueWasEncounteredWhileAttemptingToFindSongWithUrl') + ' ' + url
                            });
                        }
                    });
                }
            });
        },
        
        _getContextMenuOptions: function (isLink) {
            var urlPatterns = TabManager.get('youTubeUrlPatterns');

            var contextMenuOptions = {
                contexts: isLink ? ['link'] : ['page'],
                targetUrlPatterns: isLink ? urlPatterns : undefined,
                documentUrlPatterns: !isLink ? urlPatterns : undefined
            };

            return contextMenuOptions;
        },
        
        _onClickTextSelectionContextMenu: function (onClickData) {
            this._getSongFromText(onClickData.selectionText, function (song) {
                StreamItems.addSongs(song, {
                    playOnAdd: true
                });
            });
        },
        
        _onClickPlayContextMenu: function(onClickData) {
            var url = onClickData.linkUrl || onClickData.pageUrl;

            this._getSongFromUrl(url, function (song) {
                StreamItems.addSongs(song, {
                    playOnAdd: true
                });
            });
        },
        
        _onClickAddContextMenu: function(onClickData) {
            var url = onClickData.linkUrl || onClickData.pageUrl;

            this._getSongFromUrl(url, function (song) {
                StreamItems.addSongs(song);
            });
        },
        
        _onClickSaveContextMenu: function(onClickData) {
            var url = onClickData.linkUrl || onClickData.pageUrl;

            this._getSongFromUrl(url, function (song) {
                playlist.get('items').addSongs(song);
            });
        }
    });

    return new ContextMenu();
});