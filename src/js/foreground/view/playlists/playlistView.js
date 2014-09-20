define([
    'common/enum/listItemType',
    'foreground/collection/contextMenuItems',
    'foreground/model/contextMenuActions',
    'foreground/view/addPlaylistButtonView',
    'foreground/view/deleteButtonView',
    'foreground/view/playPlaylistButtonView',
    'foreground/view/behavior/hoverButtons',
    'foreground/view/behavior/tooltip',
    'foreground/view/prompt/deletePlaylistPromptView',
    'foreground/view/prompt/editPlaylistPromptView',
    'foreground/view/prompt/exportPlaylistPromptView',
    'text!template/playlist.html'
], function (ListItemType, ContextMenuItems, ContextMenuActions, AddPlaylistButtonView, DeleteButtonView, PlayPlaylistButtonView, HoverButtons, Tooltip, DeletePlaylistPromptView, EditPlaylistPromptView, ExportPlaylistPromptView, PlaylistTemplate) {
    'use strict';

    var Playlists = Streamus.backgroundPage.Playlists;

    //  TODO: This should implement ListItemView at some point or have a behavior for it.
    var PlaylistView = Backbone.Marionette.LayoutView.extend({
        tagName: 'li',
        className: 'playlist listItem listItem--indented listItem--small',
        template: _.template(PlaylistTemplate),
        
        templateHelpers: function () {
            return {
                itemCount: this._getItemCount()
            };
        },

        attributes: function () {
            return {
                'data-id': this.model.get('id'),
                'data-type': ListItemType.Playlist
            };
        },
        
        events: {
            'click': '_onClick',
            'contextmenu': '_showContextMenu',
            'dblclick': '_onDblClick'
        },
        
        modelEvents: {
            'change:title': '_updateTitle',
            'change:dataSourceLoaded': '_setShowingSpinnerClass',
            'change:active': '_setActiveClass'
        },
        
        ui: {
            itemCount: '.playlist-itemCount',
            title: '.playlist-title',
            buttonsRegion: '.playlist-listItemButtonsRegion'
        },
        
        regions: {
            buttonsRegion: '@ui.buttonsRegion'
        },
        
        buttonViews: [PlayPlaylistButtonView, AddPlaylistButtonView, DeleteButtonView],
        
        behaviors: {
            Tooltip: {
                behaviorClass: Tooltip
            },
            HoverButtons: {
                behaviorClass: HoverButtons
            }
        },
        
        initialize: function () {
            this.listenTo(this.model.get('items'), 'add remove reset', this._onItemCountChanged);
        },
        
        onRender: function () {
            this._setShowingSpinnerClass();
            this._setActiveClass();
        },
        
        _updateTitle: function () {
            var title = this.model.get('title');
            this.ui.title.text(title).attr('title', title);
        },
        
        _setShowingSpinnerClass: function () {
            var loading = this.model.has('dataSource') && !this.model.get('dataSourceLoaded');
            this.$el.toggleClass('is-showingSpinner', loading);
        },
        
        _setActiveClass: function () {
            var active = this.model.get('active');
            this.$el.toggleClass('is-active', active);
        },
        
        _onItemCountChanged: function() {
            this._updateItemCount();
        },
        
        _updateItemCount: function () {
            var itemCount = this._getItemCount();
            this.ui.itemCount.text(itemCount);
        },
        
        _getItemCount: function() {
            var itemCount = this.model.get('items').length;

            if (itemCount >= 1000) {
                itemCount = Math.floor(itemCount / 1000) + 'K';
            }

            return itemCount;
        },
        
        _activate: function () {
            this.model.set('active', true);
        },
        
        _showContextMenu: function (event) {
            event.preventDefault();
            
            var isEmpty = this.model.get('items').length === 0;

            //  Don't allow deleting of the last playlist.
            var isDeleteDisabled = Playlists.length === 1;

            ContextMenuItems.reset([{
                    text: chrome.i18n.getMessage('edit'),
                    onClick: this._showEditPlaylistPrompt.bind(this)
                },{
                    //  No point in sharing an empty playlist.
                    disabled: isEmpty,
                    title: isEmpty ? chrome.i18n.getMessage('playlistEmpty') : '',
                    text: chrome.i18n.getMessage('copyUrl'),
                    onClick: this._copyPlaylistUrl.bind(this)
                }, {
                    //  No point in exporting an empty playlist.
                    disabled: isEmpty,
                    title: isEmpty ? chrome.i18n.getMessage('playlistEmpty') : '',
                    text: chrome.i18n.getMessage('export'),
                    onClick: this._showExportPlaylistPrompt.bind(this)
                }, {
                    text: chrome.i18n.getMessage('delete'),
                    disabled: isDeleteDisabled,
                    title: isDeleteDisabled ? chrome.i18n.getMessage('cantDeleteLastPlaylist') : '',
                    onClick: this._showDeletePlaylistPrompt.bind(this)
                }, {
                    text: chrome.i18n.getMessage('add'),
                    disabled: isEmpty,
                    title: isEmpty ? chrome.i18n.getMessage('playlistEmpty') : '',
                    onClick: this._addSongsToStream.bind(this)
                }]
            );
        },
        
        _copyPlaylistUrl: function() {
            this.model.getShareCode(function (shareCode) {
                var shareCodeShortId = shareCode.get('shortId');
                var urlFriendlyEntityTitle = shareCode.get('urlFriendlyEntityTitle');
                var playlistShareUrl = 'https://share.streamus.com/playlist/' + shareCodeShortId + '/' + urlFriendlyEntityTitle;

                chrome.extension.sendMessage({
                    method: 'copy',
                    text: playlistShareUrl
                });
            });
        },
        
        _showEditPlaylistPrompt: function() {
            Backbone.Wreqr.radio.channel('prompt').vent.trigger('show', EditPlaylistPromptView, {
                playlist: this.model
            });
        },
        
        _showDeletePlaylistPrompt: function() {
            //  No need to notify if the playlist is empty.
            if (this.model.get('items').length === 0) {
                this.model.destroy();
            } else {
                Backbone.Wreqr.radio.channel('prompt').vent.trigger('show', DeletePlaylistPromptView, {
                    playlist: this.model
                });
            }
        },
        
        _showExportPlaylistPrompt: function() {
            Backbone.Wreqr.radio.channel('prompt').vent.trigger('show', ExportPlaylistPromptView, {
                playlist: this.model
            });
        },
        
        _addSongsToStream: function () {
            ContextMenuActions.addSongsToStream(this.model.get('items').pluck('song'));
        },
        
        _onClick: function () {
            this._activate();
        },
        
        _onDblClick: function () {
            this._activate();
        }
    });

    return PlaylistView;
});